import { PartProduct } from '../types';

const DB_NAME = 'iphone_lab_catalog_db_v1';
const DB_VERSION = 1;
const STORE_NAME = 'catalog';
const PARTS_KEY = 'all_parts';

/**
 * Opens or initializes the IndexedDB catalog store.
 * IndexedDB provides 50MB - 1GB+ storage for unlimited high-res PNGs and images.
 */
function openCatalogDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves parts array to IndexedDB.
 */
export async function savePartsToIdb(parts: PartProduct[]): Promise<void> {
  try {
    const db = await openCatalogDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(parts, PARTS_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not save to IndexedDB:', err);
  }
}

/**
 * Retrieves parts array from IndexedDB.
 */
export async function getPartsFromIdb(): Promise<PartProduct[] | null> {
  try {
    const db = await openCatalogDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(PARTS_KEY);

      request.onsuccess = () => {
        const result = request.result;
        if (Array.isArray(result) && result.length > 0) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Could not read from IndexedDB:', err);
    return null;
  }
}
