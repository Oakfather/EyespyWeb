import { getImageBlob } from '../storage/imageRepository';

export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}

export async function loadImageFromBlobKey(
  blobKey: string
): Promise<HTMLImageElement> {
  const blob = await getImageBlob(blobKey);
  if (!blob) throw new Error(`Image blob not found: ${blobKey}`);
  return loadImageFromBlob(blob);
}
