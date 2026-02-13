import { openDB, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, STORE_PROJECTS, STORE_IMAGES } from '../constants';
import type { Project } from '../types';

export interface EyespyDBSchema {
  [key: string]: {
    key: string;
    value: unknown;
  };
  projects: {
    key: string;
    value: Project;
  };
  images: {
    key: string;
    value: Blob;
  };
}

let dbPromise: Promise<IDBPDatabase<EyespyDBSchema>> | null = null;

export function getDb(): Promise<IDBPDatabase<EyespyDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<EyespyDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          db.createObjectStore(STORE_IMAGES);
        }
      },
    });
  }
  return dbPromise;
}
