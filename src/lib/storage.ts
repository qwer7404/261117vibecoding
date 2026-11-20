import type { StoredProfileRecord, StudentUser } from '../types';

const DB_NAME = 'sookmyung-culture-drive-db';
const DB_VERSION = 1;
const STORE_PROFILE = 'profile';
const USER_STORAGE_KEY = 'sookmyung-student-user-v1';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB 미지원 브라우저'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB 열기 실패'));
  });
}

export async function saveProfileRecord(record: StoredProfileRecord): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROFILE, 'readwrite');
    tx.objectStore(STORE_PROFILE).put(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error('프로필 저장 실패'));
    };
  });
}

export async function loadProfileRecord(): Promise<StoredProfileRecord | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROFILE, 'readonly');
    const req = tx.objectStore(STORE_PROFILE).get('driver-profile');
    req.onsuccess = () => {
      db.close();
      resolve((req.result as StoredProfileRecord | undefined) ?? null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error ?? new Error('프로필 조회 실패'));
    };
  });
}

export async function deleteProfileRecord(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROFILE, 'readwrite');
    tx.objectStore(STORE_PROFILE).delete('driver-profile');
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error('프로필 삭제 실패'));
    };
  });
}

export function saveStudentUser(user: StudentUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore storage restrictions
  }
}

export function loadStudentUser(): StudentUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StudentUser>;
    if (typeof parsed.nickname === 'string' && typeof parsed.age === 'number') {
      return {
        nickname: parsed.nickname,
        email: typeof parsed.email === 'string' ? parsed.email : '',
        age: parsed.age
      };
    }
    return null;
  } catch {
    return null;
  }
}
