import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  INITIAL_CHILDREN, 
  INITIAL_USERS, 
  INITIAL_BOOKS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ATTENDANCE 
} from '../data/mockData';

// ============================================================================
// 1. Data Schema Interfaces (Matching Firestore Collections Exactly)
// ============================================================================

export interface FirestoreUser {
  uid: string;
  fullName: string;
  phone: string;
  role: string;
  assignedClass: string;
  isFirstLogin: boolean;
  username?: string;
  passwordHash?: string;
}

export interface FirestoreMakhdoom {
  fullName: string;
  birthDate: string;
  stage: string;
  classGroup: string;
  points: number;
  phone: string;
  parentPhone: string;
}

export interface FirestoreAttendance {
  date: string;
  month: number;
  personId: string;
  personType: string; // 'child' | 'servant' | 'supervisor'
  eventType: string;  // 'mass' | 'sunday_school' | 'festival' | 'service_meeting' | 'supervisors_meeting'
  status: string;     // 'present' | 'absent' | 'late' | 'excused'
}

export interface FirestoreLibraryBook {
  title: string;
  category: string;
  targetGrade: string;
  fileUrl: string;
}

export interface FirestoreAnnouncement {
  title: string;
  body: string;
  targetRole: string;
  createdAt: string;
}

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  MAKHDOMEEN: 'makhdomeen',
  ATTENDANCE: 'attendance',
  LIBRARY: 'library',
  ANNOUNCEMENTS: 'announcements',
} as const;

// ============================================================================
// 2. Real-Time Listeners (Read)
// ============================================================================

export function listenToMakhdomeen(
  callback: (makhdomeen: (FirestoreMakhdoom & { id: string })[]) => void
) {
  const colRef = collection(db, COLLECTIONS.MAKHDOMEEN);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as FirestoreMakhdoom),
      }));
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.MAKHDOMEEN);
    }
  );
}

export function listenToUsers(
  callback: (users: (FirestoreUser & { id: string })[]) => void
) {
  const colRef = collection(db, COLLECTIONS.USERS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as FirestoreUser),
      }));
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.USERS);
    }
  );
}

export function listenToAttendance(
  callback: (attendance: (FirestoreAttendance & { id: string })[]) => void
) {
  const colRef = collection(db, COLLECTIONS.ATTENDANCE);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as FirestoreAttendance),
      }));
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ATTENDANCE);
    }
  );
}

export function listenToLibrary(
  callback: (books: (FirestoreLibraryBook & { id: string })[]) => void
) {
  const colRef = collection(db, COLLECTIONS.LIBRARY);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as FirestoreLibraryBook),
      }));
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.LIBRARY);
    }
  );
}

export function listenToAnnouncements(
  callback: (announcements: (FirestoreAnnouncement & { id: string })[]) => void
) {
  const colRef = collection(db, COLLECTIONS.ANNOUNCEMENTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as FirestoreAnnouncement),
      }));
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ANNOUNCEMENTS);
    }
  );
}

// ============================================================================
// 3. Write / Mutate Operations
// ============================================================================

// --- Makhdomeen ---
export async function addMakhdoomToFirestore(
  makhdoom: FirestoreMakhdoom,
  customId?: string
): Promise<string> {
  try {
    if (customId) {
      await setDoc(doc(db, COLLECTIONS.MAKHDOMEEN, customId), makhdoom);
      return customId;
    } else {
      const ref = await addDoc(collection(db, COLLECTIONS.MAKHDOMEEN), makhdoom);
      return ref.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.MAKHDOMEEN);
    throw error;
  }
}

export async function updateMakhdoomInFirestore(
  id: string,
  data: Partial<FirestoreMakhdoom>
): Promise<void> {
  const path = `${COLLECTIONS.MAKHDOMEEN}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.MAKHDOMEEN, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteMakhdoomFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.MAKHDOMEEN}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MAKHDOMEEN, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function batchAddMakhdomeenToFirestore(
  makhdomeen: (FirestoreMakhdoom & { id: string })[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    makhdomeen.forEach((m) => {
      const docRef = doc(db, COLLECTIONS.MAKHDOMEEN, m.id);
      const { id, ...data } = m;
      batch.set(docRef, data);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.MAKHDOMEEN);
    throw error;
  }
}

export async function batchUpdateMakhdomeenStagesInFirestore(
  updates: { id: string; stage: string }[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    updates.forEach((u) => {
      const docRef = doc(db, COLLECTIONS.MAKHDOMEEN, u.id);
      batch.update(docRef, { stage: u.stage });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, COLLECTIONS.MAKHDOMEEN);
    throw error;
  }
}

// --- Users ---
export async function getUserFromFirestore(uidOrIdentifier: string): Promise<FirestoreUser | null> {
  const cleanId = uidOrIdentifier.trim();
  const cleanLower = cleanId.toLowerCase();
  const path = `${COLLECTIONS.USERS}/${cleanId}`;
  try {
    // 1. Direct document lookup by doc ID (exact and lowercase)
    const snapLower = await getDoc(doc(db, COLLECTIONS.USERS, cleanLower));
    if (snapLower.exists()) {
      return { uid: snapLower.id, ...(snapLower.data() as FirestoreUser) };
    }

    const snap = await getDoc(doc(db, COLLECTIONS.USERS, cleanId));
    if (snap.exists()) {
      return { uid: snap.id, ...(snap.data() as FirestoreUser) };
    }

    // 2. Query by username (both lowercase and exact)
    const qUsernameLower = query(collection(db, COLLECTIONS.USERS), where('username', '==', cleanLower), limit(1));
    const usernameLowerSnap = await getDocs(qUsernameLower);
    if (!usernameLowerSnap.empty) {
      const firstDoc = usernameLowerSnap.docs[0];
      return { uid: firstDoc.id, ...(firstDoc.data() as FirestoreUser) };
    }

    const qUsername = query(collection(db, COLLECTIONS.USERS), where('username', '==', cleanId), limit(1));
    const usernameSnap = await getDocs(qUsername);
    if (!usernameSnap.empty) {
      const firstDoc = usernameSnap.docs[0];
      return { uid: firstDoc.id, ...(firstDoc.data() as FirestoreUser) };
    }

    // 3. Query by phone if identifier was a phone number
    const qPhone = query(collection(db, COLLECTIONS.USERS), where('phone', '==', cleanId), limit(1));
    const phoneSnap = await getDocs(qPhone);
    if (!phoneSnap.empty) {
      const firstDoc = phoneSnap.docs[0];
      return { uid: firstDoc.id, ...(firstDoc.data() as FirestoreUser) };
    }

    // 4. Query by fullName if identifier was a full name
    const qName = query(collection(db, COLLECTIONS.USERS), where('fullName', '==', cleanId), limit(1));
    const nameSnap = await getDocs(qName);
    if (!nameSnap.empty) {
      const firstDoc = nameSnap.docs[0];
      return { uid: firstDoc.id, ...(firstDoc.data() as FirestoreUser) };
    }

    // 5. Fallback scan of all users in collection if queries missed case variations
    const allUsersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    for (const d of allUsersSnap.docs) {
      const data = d.data() as FirestoreUser;
      if (
        (data.username && data.username.toLowerCase() === cleanLower) ||
        (data.phone && data.phone.trim() === cleanId) ||
        (data.fullName && data.fullName.toLowerCase() === cleanLower) ||
        d.id.toLowerCase() === cleanLower
      ) {
        return { uid: d.id, ...data };
      }
    }

    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function addUserToFirestore(user: FirestoreUser): Promise<void> {
  const usernameKey = (user.username || user.uid).toLowerCase().trim();
  const path = `${COLLECTIONS.USERS}/${usernameKey}`;
  try {
    const payload = {
      ...user,
      username: (user.username || usernameKey).toLowerCase().trim(),
      updatedAt: new Date().toISOString()
    };
    // 1. Store with document ID = username for instant O(1) lookup
    await setDoc(doc(db, COLLECTIONS.USERS, usernameKey), payload, { merge: true });
    // 2. Also store with document ID = uid if different
    if (user.uid && user.uid !== usernameKey) {
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), payload, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateUserInFirestore(
  uid: string,
  data: Partial<FirestoreUser>
): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${uid}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteUserFromFirestore(uid: string): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${uid}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// --- Attendance ---
export async function saveAttendanceToFirestore(
  entry: FirestoreAttendance
): Promise<void> {
  // Deterministic ID ensures one record per person per event per date
  const docId = `${entry.date}_${entry.eventType}_${entry.personId}`;
  const path = `${COLLECTIONS.ATTENDANCE}/${docId}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ATTENDANCE, docId), entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function batchSaveAttendanceToFirestore(
  entries: FirestoreAttendance[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    entries.forEach((entry) => {
      const docId = `${entry.date}_${entry.eventType}_${entry.personId}`;
      const docRef = doc(db, COLLECTIONS.ATTENDANCE, docId);
      batch.set(docRef, entry);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.ATTENDANCE);
    throw error;
  }
}

// --- Library ---
export async function addLibraryBookToFirestore(
  book: FirestoreLibraryBook,
  customId?: string
): Promise<string> {
  try {
    if (customId) {
      await setDoc(doc(db, COLLECTIONS.LIBRARY, customId), book);
      return customId;
    } else {
      const ref = await addDoc(collection(db, COLLECTIONS.LIBRARY), book);
      return ref.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.LIBRARY);
    throw error;
  }
}

export async function updateLibraryBookInFirestore(
  id: string,
  data: Partial<FirestoreLibraryBook>
): Promise<void> {
  const path = `${COLLECTIONS.LIBRARY}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.LIBRARY, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteLibraryBookFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.LIBRARY}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.LIBRARY, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// --- Announcements ---
export async function addAnnouncementToFirestore(
  announcement: FirestoreAnnouncement,
  customId?: string
): Promise<string> {
  try {
    if (customId) {
      await setDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, customId), announcement);
      return customId;
    } else {
      const ref = await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), announcement);
      return ref.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.ANNOUNCEMENTS);
    throw error;
  }
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.ANNOUNCEMENTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ============================================================================
// 4. Initial Seed Function (Populates empty Firestore collections on 1st run)
// ============================================================================

export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    // 1. Check Makhdomeen
    const makhdomeenSnap = await getDocs(query(collection(db, COLLECTIONS.MAKHDOMEEN), limit(1)));
    if (makhdomeenSnap.empty) {
      console.log('Seeding makhdomeen collection to Firestore...');
      const batch = writeBatch(db);
      INITIAL_CHILDREN.forEach((c) => {
        const makhdoomData: FirestoreMakhdoom = {
          fullName: c.name,
          birthDate: c.birthDate || '2017-01-01',
          stage: c.stage,
          classGroup: c.stage,
          points: 10,
          phone: c.phone || '',
          parentPhone: c.parentPhone || '',
        };
        batch.set(doc(db, COLLECTIONS.MAKHDOMEEN, c.id), makhdoomData);
      });
      await batch.commit();
    }

    // 2. Check Users
    const usersSnap = await getDocs(query(collection(db, COLLECTIONS.USERS), limit(1)));
    if (usersSnap.empty) {
      console.log('Seeding users collection to Firestore...');
      const batch = writeBatch(db);
      INITIAL_USERS.forEach((u) => {
        const userData: FirestoreUser = {
          uid: u.id,
          fullName: u.name,
          phone: u.phone || '',
          role: u.role,
          assignedClass: u.assignedStage,
          isFirstLogin: Boolean(u.isTempPassword),
        };
        batch.set(doc(db, COLLECTIONS.USERS, u.id), userData);
      });
      await batch.commit();
    }

    // 3. Check Library
    const librarySnap = await getDocs(query(collection(db, COLLECTIONS.LIBRARY), limit(1)));
    if (librarySnap.empty) {
      console.log('Seeding library collection to Firestore...');
      const batch = writeBatch(db);
      INITIAL_BOOKS.forEach((b) => {
        const bookData: FirestoreLibraryBook = {
          title: b.title,
          category: b.category,
          targetGrade: b.targetStage || (b.targetStages && b.targetStages[0]) || 'عامة',
          fileUrl: b.fileUrl || b.pdfUrl || b.coverImage || '',
        };
        batch.set(doc(db, COLLECTIONS.LIBRARY, b.id), bookData);
      });
      await batch.commit();
    }

    // 4. Check Announcements
    const announcementsSnap = await getDocs(query(collection(db, COLLECTIONS.ANNOUNCEMENTS), limit(1)));
    if (announcementsSnap.empty) {
      console.log('Seeding announcements collection to Firestore...');
      const batch = writeBatch(db);
      INITIAL_NOTIFICATIONS.forEach((n) => {
        const annData: FirestoreAnnouncement = {
          title: n.title,
          body: n.description,
          targetRole: n.targetStage || 'all',
          createdAt: n.createdAt || new Date().toISOString(),
        };
        batch.set(doc(db, COLLECTIONS.ANNOUNCEMENTS, n.id), annData);
      });
      await batch.commit();
    }

    // 5. Check Attendance
    const attendanceSnap = await getDocs(query(collection(db, COLLECTIONS.ATTENDANCE), limit(1)));
    if (attendanceSnap.empty && INITIAL_ATTENDANCE.length > 0) {
      console.log('Seeding attendance collection to Firestore...');
      const batch = writeBatch(db);
      let count = 0;
      for (const rec of INITIAL_ATTENDANCE) {
        const [year, monthStr] = rec.date.split('-');
        const monthNum = parseInt(monthStr, 10) || 1;
        for (const [pId, pData] of Object.entries(rec.records)) {
          if (count >= 400) break; // stay within batch limits
          const docId = `${rec.date}_${rec.eventType}_${pId}`;
          const attDoc: FirestoreAttendance = {
            date: rec.date,
            month: monthNum,
            personId: pId,
            personType: rec.targetType,
            eventType: rec.eventType,
            status: pData.status,
          };
          batch.set(doc(db, COLLECTIONS.ATTENDANCE, docId), attDoc);
          count++;
        }
      }
      if (count > 0) {
        await batch.commit();
      }
    }
  } catch (err) {
    console.warn('Error during Firestore initial seed:', err);
  }
}
