import { db, storage, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { ScanRecord, FaceResult } from '@/types';

const LOCAL_STORAGE_KEY = 'facelens_scans_v1';

function getLocalScans(userId: string): ScanRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return [];
    const allScans: ScanRecord[] = JSON.parse(data);
    return allScans.filter((s) => s.userId === userId);
  } catch (e) {
    console.error('Failed to read local scans:', e);
    return [];
  }
}

function saveLocalScans(scans: ScanRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: ScanRecord[] = data ? JSON.parse(data) : [];
    // Replace items with matching scan IDs or append
    const scanMap = new Map<string, ScanRecord>();
    existing.forEach((s) => scanMap.set(s.id, s));
    scans.forEach((s) => scanMap.set(s.id, s));
    const merged = Array.from(scanMap.values());
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save local scans:', e);
  }
}

function deleteLocalScan(scanId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return;
    const existing: ScanRecord[] = JSON.parse(data);
    const filtered = existing.filter((s) => s.id !== scanId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete local scan:', e);
  }
}

export async function saveScanRecord({
  userId,
  imageDataUrl,
  faces,
  source = 'upload'
}: {
  userId: string;
  imageDataUrl: string;
  faces: FaceResult[];
  source?: 'upload' | 'camera';
}): Promise<ScanRecord> {
  const scanId = 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const createdAt = new Date().toISOString();
  let finalImageUrl = imageDataUrl;

  if (isFirebaseConfigured && db && storage && !userId.startsWith('demo_')) {
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `users/${userId}/scans/${scanId}.jpg`);
      await uploadString(storageRef, imageDataUrl, 'data_url');
      finalImageUrl = await getDownloadURL(storageRef);

      // Save metadata to Firestore
      const scanData = {
        id: scanId,
        userId,
        imageUrl: finalImageUrl,
        createdAt,
        faces,
        faceCount: faces.length,
        source
      };

      const docRef = doc(db, `users/${userId}/scans/${scanId}`);
      await setDoc(docRef, scanData);

      return scanData;
    } catch (err) {
      console.warn('Firestore save failed, falling back to local storage:', err);
    }
  }

  // Fallback / Demo Mode
  const scanRecord: ScanRecord = {
    id: scanId,
    userId,
    imageUrl: finalImageUrl,
    createdAt,
    faces,
    faceCount: faces.length,
    source
  };

  saveLocalScans([scanRecord]);
  return scanRecord;
}

export async function fetchUserScans(userId: string): Promise<ScanRecord[]> {
  if (isFirebaseConfigured && db && !userId.startsWith('demo_')) {
    try {
      const scansRef = collection(db, `users/${userId}/scans`);
      const q = query(scansRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const remoteScans: ScanRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        remoteScans.push(docSnap.data() as ScanRecord);
      });
      return remoteScans;
    } catch (err) {
      console.warn('Failed to fetch from Firestore, falling back to local:', err);
    }
  }

  const local = getLocalScans(userId);
  return local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchScanById(userId: string, scanId: string): Promise<ScanRecord | null> {
  if (isFirebaseConfigured && db && !userId.startsWith('demo_')) {
    try {
      const docRef = doc(db, `users/${userId}/scans/${scanId}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as ScanRecord;
      }
    } catch (err) {
      console.warn('Failed to fetch doc from Firestore, checking local:', err);
    }
  }

  const local = getLocalScans(userId);
  return local.find((s) => s.id === scanId) || null;
}

export async function removeScanRecord(userId: string, scanId: string): Promise<void> {
  if (isFirebaseConfigured && db && storage && !userId.startsWith('demo_')) {
    try {
      const docRef = doc(db, `users/${userId}/scans/${scanId}`);
      await deleteDoc(docRef);
      const storageRef = ref(storage, `users/${userId}/scans/${scanId}.jpg`);
      await deleteObject(storageRef).catch(() => {});
    } catch (err) {
      console.warn('Failed to delete from Firestore/Storage:', err);
    }
  }

  deleteLocalScan(scanId);
}
