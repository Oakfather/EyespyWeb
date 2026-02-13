export interface FitResult {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

/** Compute letterboxed fit of an image within a canvas area. */
export function fitToViewport(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): FitResult {
  const scaleX = canvasWidth / imageWidth;
  const scaleY = canvasHeight / imageHeight;
  const scale = Math.min(scaleX, scaleY);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const x = (canvasWidth - width) / 2;
  const y = (canvasHeight - height) / 2;
  return { x, y, width, height, scale };
}

/** Convert normalized (0-1) scene coordinates to canvas pixel coordinates. */
export function sceneToCanvas(
  sceneX: number,
  sceneY: number,
  fit: FitResult
): { x: number; y: number } {
  return {
    x: fit.x + sceneX * fit.width,
    y: fit.y + sceneY * fit.height,
  };
}

/** Convert canvas pixel coordinates to normalized (0-1) scene coordinates. */
export function canvasToScene(
  canvasX: number,
  canvasY: number,
  fit: FitResult
): { x: number; y: number } {
  return {
    x: (canvasX - fit.x) / fit.width,
    y: (canvasY - fit.y) / fit.height,
  };
}
