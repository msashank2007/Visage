export interface EmotionBreakdown {
  normal: number;
  happy: number;
  excited: number;
  sad: number;
  depressed: number;
  cry: number;
  angry: number;
  shock: number;
  fearful: number;
  disgusted: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GenderMorphology {
  jawlineShape: string;
  browArch: string;
  cheekboneProminence: string;
  lipFullness: string;
  facialAspectRatio: string;
  maleTraitsScore: number;
  femaleTraitsScore: number;
  attireDescription?: string;
  necklineType?: string;
  dressSilhouette?: string;
}

export interface AgeCorrectionDetails {
  rawAge: number;
  expressionBiasOffset: number;
  activeExpressionFactor: string;
  ageGroupCategory: string;
  biometricMaturityScore: number;
  eyeToJawRatio: number;
  lowerFaceRatio: number;
  tacticsApplied: string[];
}

export interface FaceResult {
  id: string;
  boundingBox: BoundingBox;
  age: number;
  ageRange: string;
  gender: 'male' | 'female' | 'other';
  genderConfidence: number;
  dominantEmotion: keyof EmotionBreakdown;
  emotions: EmotionBreakdown;
  genderMorphology?: GenderMorphology;
  ageDetails?: AgeCorrectionDetails;
}

export interface ScanRecord {
  id: string;
  userId: string;
  imageUrl: string;
  createdAt: string; // ISO string
  faces: FaceResult[];
  faceCount: number;
  source: 'upload' | 'camera';
  note?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
  createdAt?: string;
}
