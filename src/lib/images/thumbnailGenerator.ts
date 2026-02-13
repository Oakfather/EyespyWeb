import { THUMBNAIL_MAX_SIZE } from '../constants';

export async function generateThumbnail(
  file: Blob
): Promise<{ dataUrl: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Compute thumbnail dimensions (fit within max size, maintain aspect ratio)
  let thumbW = width;
  let thumbH = height;
  if (width > THUMBNAIL_MAX_SIZE || height > THUMBNAIL_MAX_SIZE) {
    const scale = THUMBNAIL_MAX_SIZE / Math.max(width, height);
    thumbW = Math.round(width * scale);
    thumbH = Math.round(height * scale);
  }

  // Draw onto canvas
  const canvas = document.createElement('canvas');
  canvas.width = thumbW;
  canvas.height = thumbH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, thumbW, thumbH);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
  return { dataUrl, width, height };
}
