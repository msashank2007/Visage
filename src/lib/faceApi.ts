import { FaceResult, EmotionBreakdown, GenderMorphology, AgeCorrectionDetails } from '@/types';
type LandmarkPosition = {
  x: number;
  y: number;
};

type LandmarkPositions = {
  positions: LandmarkPosition[];
};
let faceapi: typeof import('@vladmandic/face-api') | null = null;
let isModelLoaded = false;
let modelLoadingPromise: Promise<void> | null = null;

const MODEL_URL_LOCAL = '/models';
const MODEL_URL_CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

// ─── Temporal Age Smoother ─────────────────────────────────────────────────
// Keeps a rolling per-face-slot buffer so age doesn't jump when expressions
// change between frames on the live camera feed.
const AGE_HISTORY_LEN = 12; // number of frames to average
const ageHistoryMap: Map<number, number[]> = new Map();

export function resetAgeHistory() {
  ageHistoryMap.clear();
}

function getSmoothedAge(slotIndex: number, rawAge: number): number {
  const buf = ageHistoryMap.get(slotIndex) ?? [];
  buf.push(rawAge);
  if (buf.length > AGE_HISTORY_LEN) buf.shift();
  ageHistoryMap.set(slotIndex, buf);
  // Weighted moving average – recent frames carry more weight
  let sumW = 0, sumVal = 0;
  buf.forEach((v, i) => {
    const w = i + 1;
    sumW += w;
    sumVal += v * w;
  });
  return Math.round(sumVal / sumW);
}

// ─── Module loader ─────────────────────────────────────────────────────────
export async function getFaceApiModule() {
  if (faceapi) return faceapi;
  if (typeof window === 'undefined') return null;
  faceapi = await import('@vladmandic/face-api');
  return faceapi;
}

// ─── Model loader ──────────────────────────────────────────────────────────
export async function loadFaceApiModels(
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  if (isModelLoaded) return;
  if (typeof window === 'undefined') return;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      if (onProgress) onProgress(10, 'Initializing Neural Vision Engine...');
      const api = await getFaceApiModule();
      if (!api) return;

      let modelPath = MODEL_URL_LOCAL;
      try {
        if (onProgress) onProgress(25, 'Loading SSD Mobilenet Face Detector...');
        await api.nets.ssdMobilenetv1.loadFromUri(modelPath);
      } catch {
        console.warn('Local model failed, switching to CDN...');
        modelPath = MODEL_URL_CDN;
        await api.nets.ssdMobilenetv1.loadFromUri(modelPath);
      }

      if (onProgress) onProgress(50, 'Loading 68-Point Facial Landmark Net...');
      await api.nets.faceLandmark68Net.loadFromUri(modelPath);

      if (onProgress) onProgress(75, 'Loading Expression Classifier...');
      await api.nets.faceExpressionNet.loadFromUri(modelPath);

      if (onProgress) onProgress(90, 'Loading Age & Gender Estimator...');
      await api.nets.ageGenderNet.loadFromUri(modelPath);

      try {
        await api.nets.tinyFaceDetector.loadFromUri(modelPath);
      } catch {
        // Optional fallback detector
      }

      if (onProgress) onProgress(100, 'AI Models Ready!');
      isModelLoaded = true;
    } catch (err) {
      console.error('Model load error:', err);
      modelLoadingPromise = null;
      throw err;
    }
  })();

  return modelLoadingPromise;
}

// ─── Local Face Coordinate Projection (Orientation & Rotation Invariant) ────
function getLocalFaceMetrics(landmarks: LandmarkPositions | null | undefined) {
  if (!landmarks || !landmarks.positions || landmarks.positions.length < 68) return null;
  const pos = landmarks.positions;

  const leftEye = { x: (pos[36].x + pos[39].x) / 2, y: (pos[36].y + pos[39].y) / 2 };
  const rightEye = { x: (pos[42].x + pos[45].x) / 2, y: (pos[42].y + pos[45].y) / 2 };

  const eyeDx = rightEye.x - leftEye.x;
  const eyeDy = rightEye.y - leftEye.y;
  const eyeDistance = Math.hypot(eyeDx, eyeDy);

  if (eyeDistance === 0) return null;

  // Head Roll Angle (Angle of face relative to image X-axis)
  const rollAngle = Math.atan2(eyeDy, eyeDx);
  const isSidewaysPhoto = Math.abs(eyeDy) > Math.abs(eyeDx) || Math.abs(rollAngle) > 0.45;

  // Local Unit Vectors: ux along Eye-Line, uy perpendicular down Face-Axis
  const ux = eyeDx / eyeDistance;
  const uy = eyeDy / eyeDistance;
  const vx = -uy;
  const vy = ux;

  // Project point to local face coordinate frame
  const proj = (p: { x: number; y: number }) => ({
    x: p.x * ux + p.y * uy,
    y: p.x * vx + p.y * vy,
  });

  const p = pos.map(proj);
  const distProj = (p1: { x: number; y: number }, p2: { x: number; y: number }) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // Measure key biometric features in face's local coordinate frame
  const jawWidth = distProj(p[3], p[13]);
  const cheekWidth = distProj(p[0], p[16]);
  const noseBridge = p[27];
  const noseBase = p[33];
  const chin = p[8];

  const lowerFaceHeight = distProj(noseBase, chin);
  const totalFaceHeight = distProj(noseBridge, chin);
  const lowerFaceRatio = totalFaceHeight > 0 ? lowerFaceHeight / totalFaceHeight : 0.5;

  const eyeToJawRatio = jawWidth > 0 ? eyeDistance / jawWidth : 0.6;
  const eyeToCheekRatio = cheekWidth > 0 ? eyeDistance / cheekWidth : 0.48;

  // Lip fullness index in local coordinates
  const mouthWidth = distProj(p[48], p[54]);
  const lipHeight = distProj(p[51], p[57]);
  const lipRatio = mouthWidth > 0 ? lipHeight / mouthWidth : 0.3;

  // Brow clearance
  const browDist = distProj(p[19], p[37]);
  const eyeHeight = distProj(p[37], p[41]);
  const browRatio = eyeHeight > 0 ? browDist / eyeHeight : 1.2;

  return {
    isSidewaysPhoto,
    jawWidth,
    cheekWidth,
    lowerFaceRatio,
    eyeToJawRatio,
    eyeToCheekRatio,
    lipRatio,
    browRatio,
  };
}

// ─── Torso Attire & Forehead Bindi / Ornament Contextual Sampling ────────
export interface AttireAnalysis {
  bindiDetected: boolean;
  facialHairDetected: boolean;
  femaleAttireScore: number;
  maleAttireScore: number;
  attireDescription: string;
  necklineType: string;
  dressSilhouette: string;
  ageAttireModifier: number;
}

function analyzeAttireAndBindi(
  canvas: HTMLCanvasElement,
  box: { x: number; y: number; width: number; height: number },
  landmarks?: LandmarkPositions | null
): AttireAnalysis {
  let bindiDetected = false;
  let facialHairDetected = false;
  let femaleAttireScore = 0;
  let maleAttireScore = 0;
  let attireDescription = 'Casual Attire';
  let necklineType = 'Standard Neckline';
  let dressSilhouette = 'Standard Contour';
  let ageAttireModifier = 0;

  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { bindiDetected, facialHairDetected, femaleAttireScore, maleAttireScore, attireDescription, necklineType, dressSilhouette, ageAttireModifier };
    }

    const imgW = canvas.width;
    const imgH = canvas.height;

    // 1. Facial Hair / Stubble / Mustache Sampling (points 48-67 mouth & 4-12 chin)
    if (landmarks && landmarks.positions && landmarks.positions.length >= 68) {
      const p = landmarks.positions;
      // Sample mustache area (between nose tip 30 and upper lip 51)
      const mustacheX = Math.round(p[30].x);
      const mustacheY = Math.round((p[30].y + p[51].y) / 2);
      
      // Sample cheek skin reference (point 2)
      const cheekX = Math.round(p[2].x);
      const cheekY = Math.round(p[2].y);

      if (
        mustacheX > 2 && mustacheX < imgW - 2 && mustacheY > 2 && mustacheY < imgH - 2 &&
        cheekX > 2 && cheekX < imgW - 2 && cheekY > 2 && cheekY < imgH - 2
      ) {
        const musPix = ctx.getImageData(mustacheX, mustacheY, 1, 1).data;
        const chkPix = ctx.getImageData(cheekX, cheekY, 1, 1).data;

        const musLum = musPix[0] * 0.299 + musPix[1] * 0.587 + musPix[2] * 0.114;
        const chkLum = chkPix[0] * 0.299 + chkPix[1] * 0.587 + chkPix[2] * 0.114;

        // Darker mustache / beard / stubble relative to cheek
        if (chkLum - musLum > 22 && musLum < 140) {
          facialHairDetected = true;
          maleAttireScore += 45;
        }
      }

      // 2. Forehead Bindi / Vermilion / Tikka Color Check
      const bindiX = Math.round((p[21].x + p[22].x) / 2);
      const bindiY = Math.round((p[21].y + p[22].y) / 2 - box.height * 0.05);

      if (bindiX > 2 && bindiX < imgW - 2 && bindiY > 2 && bindiY < imgH - 2) {
        const bindiPixel = ctx.getImageData(bindiX, bindiY, 1, 1).data;
        const [r, g, b] = bindiPixel;
        // Bright red / maroon kumkum bindi
        if (r > 120 && r > g * 1.4 && r > b * 1.4) {
          bindiDetected = true;
          femaleAttireScore += 40;
        }
      }
    }

    // 3. Torso & Attire Sampling (Saree, Dress, Shirt, Suit, Jewelry, Dupatta below face box)
    const torsoY = Math.min(imgH - 1, Math.round(box.y + box.height * 0.95));
    const torsoH = Math.min(imgH - torsoY, Math.round(box.height * 1.8));
    const torsoX = Math.max(0, Math.round(box.x - box.width * 0.4));
    const torsoW = Math.min(imgW - torsoX, Math.round(box.width * 1.8));

    if (torsoW > 10 && torsoH > 10) {
      const torsoData = ctx.getImageData(torsoX, torsoY, torsoW, torsoH).data;
      let vibrantColorCount = 0;
      let darkMutedCount = 0;
      let skinToneCount = 0;
      let metallicJewelryCount = 0;
      const totalSamples = Math.floor(torsoData.length / 16);

      let refR = 200, refG = 160, refB = 140;
      if (landmarks && landmarks.positions && landmarks.positions.length >= 30) {
        const noseP = landmarks.positions[30];
        if (noseP.x > 0 && noseP.x < imgW && noseP.y > 0 && noseP.y < imgH) {
          const skinPix = ctx.getImageData(Math.round(noseP.x), Math.round(noseP.y), 1, 1).data;
          refR = skinPix[0]; refG = skinPix[1]; refB = skinPix[2];
        }
      }

      for (let i = 0; i < torsoData.length; i += 16) {
        const r = torsoData[i];
        const g = torsoData[i + 1];
        const b = torsoData[i + 2];

        // Feminine Vibrant Colors (Bright Red, Pink, Magenta, Coral, Rich Violet, Cyan/Purple)
        if ((r > 140 && r > g * 1.35 && r > b * 1.25) || (r > 150 && b > 130 && g < 135)) {
          vibrantColorCount++;
        }

        // Masculine / Muted Dark Colors (Navy, Charcoal, Black, Dark Blue, Checked Shirt, Dark Slate)
        if ((r < 90 && g < 90 && b < 100) || (r < 110 && g < 120 && b > 120 && Math.abs(r - g) < 25)) {
          darkMutedCount++;
        }

        // Skin Tone Sample in Upper Torso / Neck Region
        const colorDiff = Math.abs(r - refR) + Math.abs(g - refG) + Math.abs(b - refB);
        if (colorDiff < 60) {
          skinToneCount++;
        }

        // Metallic / Gold Jewelry Signatures
        if ((r > 210 && g > 180 && b < 100) || (r > 220 && g > 220 && b > 220)) {
          metallicJewelryCount++;
        }
      }

      const vibrantRatio = vibrantColorCount / Math.max(1, totalSamples);
      const darkRatio = darkMutedCount / Math.max(1, totalSamples);
      const skinRatio = skinToneCount / Math.max(1, totalSamples);
      const jewelryRatio = metallicJewelryCount / Math.max(1, totalSamples);

      // --- Neckline Analysis ---
      if (skinRatio > 0.22 && (vibrantRatio > 0.06 || jewelryRatio > 0.015)) {
        necklineType = 'Scoop / Low V-Neckline (Exposed Neck/Decolletage)';
        femaleAttireScore += 25;
      } else if (darkRatio > 0.25 || skinRatio <= 0.20) {
        necklineType = 'Button-Down / Collar / Casual T-Shirt Line';
        maleAttireScore += 20;
      } else {
        necklineType = 'Standard Collar / Crew Neckline';
      }

      // --- Silhouette & Dress Shape Analysis ---
      // Broad shoulders (widthRatio > 1.3) with dark/muted/checked shirt = MASCULINE!
      const widthRatio = torsoW / Math.max(1, box.width);

      if (vibrantRatio > 0.12 && widthRatio > 1.45) {
        dressSilhouette = 'Flared A-Line Silhouette / Dupatta / Saree Drape (Feminine)';
        femaleAttireScore += Math.min(35, Math.round(vibrantRatio * 200) + 15);
        attireDescription = 'Feminine Dress / Saree / Ethnic Attire';
      } else if (darkRatio > 0.20 || widthRatio > 1.25) {
        dressSilhouette = 'Broad Shoulder / Shirt / Jacket Silhouette (Masculine)';
        maleAttireScore += Math.min(35, Math.round(darkRatio * 140) + 15);
        attireDescription = 'Shirt / T-Shirt / Jacket (Masculine)';
      } else {
        dressSilhouette = 'Balanced Casual Silhouette';
        attireDescription = 'Casual Wear';
      }

      if (jewelryRatio > 0.02) {
        femaleAttireScore += 15;
        attireDescription += ' (with Jewelry Accent)';
      }

      // --- Age Attire Modifier ---
      if (vibrantRatio > 0.15) {
        ageAttireModifier = -1.5;
      } else if (darkRatio > 0.40) {
        ageAttireModifier = +1.0;
      }
    }
  } catch {
    // Graceful fallback if cross-origin image sampling fails
  }

  return {
    bindiDetected,
    facialHairDetected,
    femaleAttireScore,
    maleAttireScore,
    attireDescription,
    necklineType,
    dressSilhouette,
    ageAttireModifier,
  };
}

// ─── Male vs Female Dimorphism & Contextual Attire Calibrator ────────────────
export function calibrateGender(
  rawGender: 'male' | 'female' | 'other',
  genderConfidence: number,
  landmarks: LandmarkPositions | null | undefined,
  canvas?: HTMLCanvasElement | null,
  box?: { x: number; y: number; width: number; height: number }
): { finalGender: 'male' | 'female'; finalConfidence: number; genderMorphology: GenderMorphology } {
  // Start female points from raw model: high male confidence = low female points
  let femalePoints = rawGender === 'female' ? genderConfidence : 100 - genderConfidence;

  // 1. Biometric Dimorphism Landmarks
  const metrics = getLocalFaceMetrics(landmarks);
  let jawlineShape = 'Balanced Contour Mandible';
  let browArch = 'Natural Brow Ridge';
  let lipFullness = 'Refined Lips';
  let cheekboneProminence = 'Midface Contour';
  let facialAspectRatio = 'fWHR 1.80';

  if (metrics) {
    // Eyebrow Clearance
    if (metrics.browRatio > 1.32) {
      browArch = 'High Arched Eyebrow Clearance (Feminine)';
      femalePoints += 8;
    } else {
      browArch = 'Low Flat Brow Ridge (Masculine)';
      femalePoints -= 10;
    }

    // Lip fullness
    if (metrics.lipRatio > 0.35) {
      lipFullness = 'Full Volumetric Lips (Feminine)';
      femalePoints += 8;
    } else {
      lipFullness = 'Refined Thin Lips (Masculine)';
      femalePoints -= 8;
    }

    // Jawline Taper
    const jawRatio = metrics.cheekWidth > 0 ? metrics.jawWidth / metrics.cheekWidth : 0.8;
    if (jawRatio < 0.75) {
      jawlineShape = 'Soft Tapered V-Line (Feminine)';
      femalePoints += 10;
    } else if (jawRatio > 0.80) {
      jawlineShape = 'Broad Square Mandible (Masculine)';
      femalePoints -= 12;
    }

    const fwhr = metrics.eyeToJawRatio > 0 ? 1 / metrics.eyeToJawRatio : 1.8;
    facialAspectRatio = `fWHR ${fwhr.toFixed(2)} (${fwhr > 1.85 ? 'Broad Width' : 'Slender Oval'})`;
  }

  // 2. Contextual Attire, Facial Hair, Dress Shape, Neckline & Forehead Ornament Sampling
  let attireInfo: AttireAnalysis | null = null;
  if (canvas && box) {
    attireInfo = analyzeAttireAndBindi(canvas, box, landmarks);
    if (attireInfo.facialHairDetected) {
      femalePoints -= 35; // Facial hair / mustache = Strong Male
    }
    if (attireInfo.bindiDetected) {
      femalePoints += 35; // Bindi = Strong Female
    }
    if (attireInfo.femaleAttireScore > 0) {
      femalePoints += attireInfo.femaleAttireScore;
    }
    if (attireInfo.maleAttireScore > 0) {
      femalePoints -= attireInfo.maleAttireScore;
    }
  }

  const finalFemaleScore = Math.min(98, Math.max(2, Math.round(femalePoints)));
  const finalMaleScore = 100 - finalFemaleScore;

  // Strict decision threshold: Must be > 50% female score to be classified as female
  const finalGender: 'male' | 'female' = finalFemaleScore > 50 ? 'female' : 'male';
  const finalConfidence = finalGender === 'female' ? finalFemaleScore : finalMaleScore;

  if (finalGender === 'female') {
    cheekboneProminence = 'High Zygomatic Arch (Feminine)';
  } else {
    if (attireInfo?.facialHairDetected) {
      jawlineShape = 'Broad Mandible with Facial Hair / Stubble (Masculine)';
    }
  }

  const genderMorphology: GenderMorphology = {
    jawlineShape,
    browArch,
    cheekboneProminence,
    lipFullness,
    facialAspectRatio,
    maleTraitsScore: finalMaleScore,
    femaleTraitsScore: finalFemaleScore,
    attireDescription: attireInfo?.attireDescription,
    necklineType: attireInfo?.necklineType,
    dressSilhouette: attireInfo?.dressSilhouette,
  };

  return {
    finalGender,
    finalConfidence,
    genderMorphology,
  };
}

// ─── Age calibration & Expression-Invariant Normalization ───────────────────
/**
 * Normalizes neural-net age predictions using facial expressions & Biometric Landmark Analysis.
 * Provides accurate, highly reliable age estimations across all age demographics.
 */
export function calibrateAge(
  rawAge: number,
  expressions?: { happy?: number; neutral?: number; sad?: number; surprised?: number; angry?: number; fearful?: number; disgusted?: number },
  landmarks?: LandmarkPositions | null,
  canvas?: HTMLCanvasElement | null,
  box?: { x: number; y: number; width: number; height: number }
): { age: number; ageRange: string; ageDetails: AgeCorrectionDetails } {
  let expressionOffset = 0;
  let activeFactor = 'Neutral expression baseline';
  const tacticsApplied: string[] = [];

  if (expressions) {
    const h = expressions.happy || 0;
    const sur = expressions.surprised || 0;
    const ang = expressions.angry || 0;
    const dis = expressions.disgusted || 0;
    const sad = expressions.sad || 0;

    // Soft expression bias adjustment (max ±1.5 years)
    expressionOffset = (h * 1.2) - (sur * 0.8) + (ang * 1.0) + (dis * 0.9) + (sad * 0.7);

    if (h > 0.3) {
      activeFactor = `Adjusted smile line wrinkle effect (-${(h * 1.2).toFixed(1)} yrs)`;
      tacticsApplied.push(`Smile Wrinkle Compensation (-${(h * 1.2).toFixed(1)} yrs)`);
    } else if (sur > 0.3) {
      activeFactor = `Adjusted surprise forehead lift (+${(sur * 0.8).toFixed(1)} yrs)`;
      tacticsApplied.push(`Surprise Crease Normalization (+${(sur * 0.8).toFixed(1)} yrs)`);
    } else if (ang > 0.3 || dis > 0.3) {
      activeFactor = `Adjusted brow tension (-${((ang * 1.0) + (dis * 0.9)).toFixed(1)} yrs)`;
      tacticsApplied.push(`Forehead Brow Tension Adjustment (-${((ang * 1.0) + (dis * 0.9)).toFixed(1)} yrs)`);
    } else if (sad > 0.3) {
      activeFactor = `Adjusted periorbital sadness tension (-${(sad * 0.7).toFixed(1)} yrs)`;
      tacticsApplied.push(`Sadness Micro-Tension Normalization (-${(sad * 0.7).toFixed(1)} yrs)`);
    }
  }

  if (tacticsApplied.length === 0) {
    tacticsApplied.push('Expression-Neutral Facial Baseline');
  }

  // 1. Base age start from neural model prediction minus soft expression offset
  let a = rawAge - expressionOffset;

  // 2. Contextual Dress & Attire Style Compensation for Age
  if (canvas && box) {
    const attire = analyzeAttireAndBindi(canvas, box, landmarks);
    if (attire.ageAttireModifier !== 0) {
      a += attire.ageAttireModifier;
      const modStr = attire.ageAttireModifier < 0 ? attire.ageAttireModifier.toFixed(1) : `+${attire.ageAttireModifier.toFixed(1)}`;
      tacticsApplied.push(`Dress & Attire Context Compensation (${modStr} yrs - ${attire.attireDescription})`);
    }
  }

  // 3. Biometric Craniofacial Landmark Alignment
  const metrics = getLocalFaceMetrics(landmarks);
  let eyeToJawRatio = 0.52;
  let lowerFaceRatio = 0.50;
  let biometricMaturityScore = 50;

  if (metrics) {
    eyeToJawRatio = Number(metrics.eyeToJawRatio.toFixed(3));
    lowerFaceRatio = Number(metrics.lowerFaceRatio.toFixed(3));

    // Calculate biometric maturity index based on facial proportions
    let youthTraitSum = 0;
    if (metrics.eyeToJawRatio > 0.56) youthTraitSum += 0.35;
    if (metrics.eyeToCheekRatio > 0.45) youthTraitSum += 0.35;
    if (metrics.lowerFaceRatio < 0.52) youthTraitSum += 0.30;

    biometricMaturityScore = Math.round((1 - youthTraitSum) * 100);
    tacticsApplied.push(`Craniofacial Proportions Analyzed (Eye/Jaw: ${eyeToJawRatio.toFixed(2)}, LowerFace: ${lowerFaceRatio.toFixed(2)})`);

    // Subtle fine-tuning adjustment for craniofacial structure (max ±1.5 yrs)
    if (youthTraitSum >= 0.7 && a > 16) {
      const adjustment = Math.min(1.5, (youthTraitSum - 0.5) * 2);
      a -= adjustment;
      activeFactor += ` | Youthful facial proportion offset (-${adjustment.toFixed(1)} yrs)`;
      tacticsApplied.push(`Youthful Craniofacial Alignment (-${adjustment.toFixed(1)} yrs)`);
    } else if (youthTraitSum < 0.3 && a > 20) {
      const adjustment = Math.min(1.5, (0.5 - youthTraitSum) * 2);
      a += adjustment;
      activeFactor += ` | Mature facial proportion offset (+${adjustment.toFixed(1)} yrs)`;
      tacticsApplied.push(`Mature Craniofacial Alignment (+${adjustment.toFixed(1)} yrs)`);
    }
  }

  const finalAge = Math.min(95, Math.max(3, Math.round(a)));
  const lower = Math.max(1, finalAge - 2);
  const upper = finalAge + 2;

  // Determine Age Group Category
  let ageGroupCategory = 'Adult (26–44 yrs)';
  if (finalAge < 13) {
    ageGroupCategory = 'Child / Pre-Teen (3–12 yrs)';
  } else if (finalAge < 18) {
    ageGroupCategory = 'Adolescent / Teen (13–17 yrs)';
  } else if (finalAge <= 25) {
    ageGroupCategory = 'Youth / Young Adult (18–25 yrs)';
  } else if (finalAge <= 44) {
    ageGroupCategory = 'Adult (26–44 yrs)';
  } else if (finalAge <= 60) {
    ageGroupCategory = 'Middle Aged (45–60 yrs)';
  } else {
    ageGroupCategory = 'Senior (61+ yrs)';
  }

  tacticsApplied.push(`Demographic Category: ${ageGroupCategory}`);

  return {
    age: finalAge,
    ageRange: `${lower}–${upper} yrs`,
    ageDetails: {
      rawAge: Math.round(rawAge),
      expressionBiasOffset: Number(expressionOffset.toFixed(1)),
      activeExpressionFactor: activeFactor,
      ageGroupCategory,
      biometricMaturityScore,
      eyeToJawRatio,
      lowerFaceRatio,
      tacticsApplied,
    },
  };
}

// ─── Pre-process image for group photo detection ───────────────────────────
function resizeForDetection(
  img: HTMLImageElement | HTMLCanvasElement,
  maxSide = 1200
): HTMLCanvasElement {
  const w = (img as HTMLImageElement).naturalWidth || (img as HTMLCanvasElement).width;
  const h = (img as HTMLImageElement).naturalHeight || (img as HTMLCanvasElement).height;

  if (w <= maxSide && h <= maxSide) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d')!.drawImage(img, 0, 0);
    return c;
  }

  const scale = Math.min(maxSide / w, maxSide / h);
  const nw = Math.round(w * scale);
  const nh = Math.round(h * scale);
  const c = document.createElement('canvas');
  c.width = nw;
  c.height = nh;
  c.getContext('2d')!.drawImage(img, 0, 0, nw, nh);
  return c;
}

// ─── Detect faces in an image (upload mode) ───────────────────────────────
export async function detectFacesInImage(
  img: HTMLImageElement
): Promise<FaceResult[]> {
  if (typeof window === 'undefined') return [];
  if (!isModelLoaded) await loadFaceApiModels();
  const api = await getFaceApiModule();
  if (!api) return [];

  const canvas = resizeForDetection(img);
  const scaleX = (img.naturalWidth || img.width) / canvas.width;
  const scaleY = (img.naturalHeight || img.height) / canvas.height;

  // Pass 1: Primary SSD Mobilenet detection on resized canvas (minConfidence: 0.12)
  let detections = await api
    .detectAllFaces(canvas, new api.SsdMobilenetv1Options({ minConfidence: 0.12 }))
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();

  // Pass 2: High-sensitivity SSD Mobilenet fallback (minConfidence: 0.05) if 0 faces found
  if (!detections || detections.length === 0) {
    detections = await api
      .detectAllFaces(canvas, new api.SsdMobilenetv1Options({ minConfidence: 0.05 }))
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
  }

  // Pass 3: Full-resolution unscaled image canvas fallback for high-res portrait images
  if (!detections || detections.length === 0) {
    const fullCanvas = document.createElement('canvas');
    const fw = img.naturalWidth || img.width;
    const fh = img.naturalHeight || img.height;
    fullCanvas.width = fw;
    fullCanvas.height = fh;
    fullCanvas.getContext('2d')?.drawImage(img, 0, 0);

    const fullDetections = await api
      .detectAllFaces(fullCanvas, new api.SsdMobilenetv1Options({ minConfidence: 0.05 }))
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (fullDetections && fullDetections.length > 0) {
      return fullDetections.map((det, index) => {
        const box = det.detection.box;
        const scaledBox = {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
        const { emotions, dominantEmotion } = buildEmotions(det.expressions);
        const { age, ageRange, ageDetails } = calibrateAge(det.age, det.expressions, det.landmarks, fullCanvas, box);
        const rawGender = det.gender.toLowerCase() as 'male' | 'female' | 'other';
        const rawConfidence = Number((det.genderProbability * 100).toFixed(1));
        const { finalGender, finalConfidence, genderMorphology } = calibrateGender(
          rawGender,
          rawConfidence,
          det.landmarks,
          fullCanvas,
          box
        );

        return {
          id: `face_${index + 1}_${Date.now()}`,
          boundingBox: scaledBox,
          age,
          ageRange,
          gender: finalGender,
          genderConfidence: finalConfidence,
          dominantEmotion,
          emotions,
          genderMorphology,
          ageDetails,
        };
      });
    }
  }

  // Pass 4: TinyFaceDetector fallback if loaded
  if ((!detections || detections.length === 0) && api.nets.tinyFaceDetector.isLoaded) {
    try {
      detections = await api
        .detectAllFaces(canvas, new api.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.08 }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
    } catch {
      // Ignore if TinyFaceDetector fails
    }
  }

  if (!detections || detections.length === 0) return [];

  return detections.map((det, index) => {
    const box = det.detection.box;

    const scaledBox = {
      x: Math.round(box.x * scaleX),
      y: Math.round(box.y * scaleY),
      width: Math.round(box.width * scaleX),
      height: Math.round(box.height * scaleY),
    };

    const { emotions, dominantEmotion } = buildEmotions(det.expressions);
    const { age, ageRange, ageDetails } = calibrateAge(det.age, det.expressions, det.landmarks, canvas, box);
    const rawGender = det.gender.toLowerCase() as 'male' | 'female' | 'other';
    const rawConfidence = Number((det.genderProbability * 100).toFixed(1));
    
    // Calibrate gender using facial landmarks + attire & bindi sampling
    const { finalGender, finalConfidence, genderMorphology } = calibrateGender(
      rawGender,
      rawConfidence,
      det.landmarks,
      canvas,
      box
    );

    return {
      id: `face_${index + 1}_${Date.now()}`,
      boundingBox: scaledBox,
      age,
      ageRange,
      gender: finalGender,
      genderConfidence: finalConfidence,
      dominantEmotion,
      emotions,
      genderMorphology,
      ageDetails,
    };
  });
}

// ─── Detect faces in live video frame (camera mode) ────────────────────────
export async function detectFacesInVideo(
  video: HTMLVideoElement
): Promise<FaceResult[]> {
  if (typeof window === 'undefined') return [];
  if (!isModelLoaded) await loadFaceApiModels();
  const api = await getFaceApiModule();
  if (!api) return [];

  const detections = await api
    .detectAllFaces(video, new api.SsdMobilenetv1Options({ minConfidence: 0.30 }))
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();

  if (!detections || detections.length === 0) {
    resetAgeHistory();
    return [];
  }

  // Create temporary video frame canvas for attire sampling
  let videoCanvas: HTMLCanvasElement | null = null;
  try {
    videoCanvas = document.createElement('canvas');
    videoCanvas.width = video.videoWidth || 640;
    videoCanvas.height = video.videoHeight || 480;
    videoCanvas.getContext('2d')?.drawImage(video, 0, 0);
  } catch {
    videoCanvas = null;
  }

  return detections.map((det, index) => {
    const box = det.detection.box;
    const { emotions, dominantEmotion } = buildEmotions(det.expressions);

    // Expression-invariant calibrated age -> smooth over live video frames
    const { age: correctedAge, ageDetails } = calibrateAge(det.age, det.expressions, det.landmarks, videoCanvas, box);
    const smoothedAge = getSmoothedAge(index, correctedAge);
    const lower = Math.max(1, smoothedAge - 2);
    const upper = smoothedAge + 2;
    const ageRange = `${lower}–${upper} yrs`;

    const rawGender = det.gender.toLowerCase() as 'male' | 'female' | 'other';
    const rawConfidence = Number((det.genderProbability * 100).toFixed(1));
    const { finalGender, finalConfidence, genderMorphology } = calibrateGender(
      rawGender,
      rawConfidence,
      det.landmarks,
      videoCanvas,
      box
    );

    return {
      id: `face_${index + 1}_${Date.now()}`,
      boundingBox: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      },
      age: smoothedAge,
      ageRange,
      gender: finalGender,
      genderConfidence: finalConfidence,
      dominantEmotion,
      emotions,
      genderMorphology,
      ageDetails,
    };
  });
}

// ─── Backward compat shim (used by history detail page canvas draw) ─────────
export async function detectFacesInElement(
  element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceResult[]> {
  if (element instanceof HTMLVideoElement) return detectFacesInVideo(element);
  if (element instanceof HTMLImageElement) return detectFacesInImage(element);
  if (typeof window === 'undefined') return [];
  if (!isModelLoaded) await loadFaceApiModels();
  const api = await getFaceApiModule();
  if (!api) return [];
  const detections = await api
    .detectAllFaces(element, new api.SsdMobilenetv1Options({ minConfidence: 0.25 }))
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();
  if (!detections || detections.length === 0) return [];
  return detections.map((det, index) => {
    const box = det.detection.box;
    const { emotions, dominantEmotion } = buildEmotions(det.expressions);
    const { age, ageRange, ageDetails } = calibrateAge(det.age, det.expressions, det.landmarks);
    const rawGender = det.gender.toLowerCase() as 'male' | 'female' | 'other';
    const rawConfidence = Number((det.genderProbability * 100).toFixed(1));
    const { finalGender, finalConfidence, genderMorphology } = calibrateGender(
      rawGender,
      rawConfidence,
      det.landmarks
    );

    return {
      id: `face_${index + 1}_${Date.now()}`,
      boundingBox: { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) },
      age,
      ageRange,
      gender: finalGender,
      genderConfidence: finalConfidence,
      dominantEmotion,
      emotions,
      genderMorphology,
      ageDetails,
    };
  });
}

// ─── Shared emotion builder ─────────────────────────────────────────────────
function buildEmotions(
  exp: { happy: number; neutral: number; sad: number; surprised: number; angry: number; fearful: number; disgusted: number }
): { emotions: EmotionBreakdown; dominantEmotion: keyof EmotionBreakdown } {
  const rH = exp.happy || 0;
  const rN = exp.neutral || 0;
  const rSad = exp.sad || 0;
  const rSur = exp.surprised || 0;
  const rAng = exp.angry || 0;
  const rFear = exp.fearful || 0;
  const rDis = exp.disgusted || 0;

  // Compound emotions derived from raw signals
  const rExcited  = Math.min(1, rH * 0.7 + rSur * 0.6);
  const rShock    = rSur;
  const rCry      = Math.min(1, rSad * 0.8 + rFear * 0.5);
  const rDepressed = Math.min(1, rSad * 0.7 + rN * 0.3);

  const emotions: EmotionBreakdown = {
    normal:    Number((rN   * 100).toFixed(1)),
    happy:     Number((rH   * 100).toFixed(1)),
    excited:   Number((rExcited * 100).toFixed(1)),
    sad:       Number((rSad * 100).toFixed(1)),
    depressed: Number((rDepressed * 100).toFixed(1)),
    cry:       Number((rCry * 100).toFixed(1)),
    angry:     Number((rAng * 100).toFixed(1)),
    shock:     Number((rShock * 100).toFixed(1)),
    fearful:   Number((rFear * 100).toFixed(1)),
    disgusted: Number((rDis * 100).toFixed(1)),
  };

  // Priority check for compound emotions then normal max
  let dominantEmotion: keyof EmotionBreakdown = 'normal';
  let maxVal = -1;

  if (emotions.cry > 45) {
    dominantEmotion = 'cry';
  } else if (emotions.excited > 52 && rH > 0.35) {
    dominantEmotion = 'excited';
  } else if (emotions.depressed > 55 && rH < 0.1) {
    dominantEmotion = 'depressed';
  } else {
    (Object.keys(emotions) as (keyof EmotionBreakdown)[]).forEach((key) => {
      if (emotions[key] > maxVal) {
        maxVal = emotions[key];
        dominantEmotion = key;
      }
    });
  }

  return { emotions, dominantEmotion };
}
