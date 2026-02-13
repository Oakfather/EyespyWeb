import { getDb } from './db';
import { STORE_IMAGES } from '../constants';

export async function saveImageBlob(blobKey: string, blob: Blob): Promise<void> {
  const db = await getDb();
  await db.put(STORE_IMAGES, blob, blobKey);
}

export async function getImageBlob(blobKey: string): Promise<Blob | undefined> {
  const db = await getDb();
  return db.get(STORE_IMAGES, blobKey);
}

export async function deleteImageBlob(blobKey: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_IMAGES, blobKey);
}
