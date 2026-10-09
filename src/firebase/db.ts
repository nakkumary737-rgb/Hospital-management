import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  Patient,
  Card,
  HealthcarePackage,
  Membership,
  FamilyMember,
  ChronicProgram,
  ChronicMembership,
  SickleCellProfile,
  Facility,
  Visit,
  Payment,
  Receipt,
  ServiceAuthorization,
  ProviderClaim,
  FacilitySettlement,
  AuditLog
} from '../types';
import {
  initialFacilities,
  initialPackages,
  initialChronicPrograms
} from '../data/seedData';

/**
 * Recursively strips undefined fields from an object so Firestore setDoc does not throw
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function cleanFirestoreData<T>(input: T): any {
  if (input === null || input === undefined) {
    return null;
  }
  if (Array.isArray(input)) {
    return input
      .filter(item => item !== undefined)
      .map(item => cleanFirestoreData(item));
  }
  if (typeof input === 'object') {
    // Preserve instances of Date
    if (input instanceof Date) {
      return input;
    }
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        result[key] = cleanFirestoreData(value);
      }
    }
    return result;
  }
  return input;
}

export async function saveFirestoreDoc<T extends Record<string, any>>(
  collectionPath: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const cleaned = cleanFirestoreData(data);
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
  }
}

export async function deleteFirestoreDoc(
  collectionPath: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${docId}`);
  }
}

export function subscribeToCollection<T>(
  collectionPath: string,
  onData: (data: T[]) => void
): () => void {
  try {
    const colRef = collection(db, collectionPath);
    return onSnapshot(
      colRef,
      snapshot => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
        onData(items);
      },
      error => {
        console.warn(`Firestore snapshot issue on ${collectionPath}:`, error.message);
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );
  } catch (err) {
    console.warn(`Could not attach listener for ${collectionPath}:`, err);
    return () => {};
  }
}

/**
 * Initialize core system master reference definitions if Firestore database is empty
 */
export async function initializeCoreMasterDataIfNeeded(): Promise<void> {
  try {
    const facilitiesSnap = await getDocs(collection(db, 'facilities'));
    if (facilitiesSnap.empty) {
      for (const fac of initialFacilities) {
        await setDoc(doc(db, 'facilities', fac.id), fac);
      }
    }

    const packagesSnap = await getDocs(collection(db, 'packages'));
    if (packagesSnap.empty) {
      for (const pkg of initialPackages) {
        await setDoc(doc(db, 'packages', pkg.id), pkg);
      }
    }

    const programsSnap = await getDocs(collection(db, 'chronicPrograms'));
    if (programsSnap.empty) {
      for (const prog of initialChronicPrograms) {
        await setDoc(doc(db, 'chronicPrograms', prog.id), prog);
      }
    }

    // Purge any legacy sample/dummy patient and transaction records from Firestore
    await purgeLegacySampleDataIfNeeded();
  } catch (err) {
    console.warn('Real-time DB master initialization warning (operating with local fallback):', err);
  }
}

/**
 * Remove legacy sample/demo patient and transactional records from Firestore
 */
export async function purgeLegacySampleDataIfNeeded(): Promise<void> {
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    const dummyNames = ['nakato', 'kato', 'nsenyange', 'namubiru', 'ssekandi', 'demo', 'sample'];
    
    for (const d of patientsSnap.docs) {
      const data = d.data() as any;
      const name = (data.fullName || '').toLowerCase();
      const id = (data.id || d.id || '').toLowerCase();
      const isDummy = dummyNames.some(dummy => name.includes(dummy) || id.includes(dummy));
      
      if (isDummy) {
        await deleteDoc(d.ref);
      }
    }

    // Also clean up any orphan dummy cards
    const cardsSnap = await getDocs(collection(db, 'cards'));
    for (const d of cardsSnap.docs) {
      const data = d.data() as any;
      const pid = (data.patientId || '').toLowerCase();
      if (dummyNames.some(dummy => pid.includes(dummy)) || (data.id && data.id.startsWith('crd-sample'))) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.warn('Sample data purge check:', err);
  }
}

