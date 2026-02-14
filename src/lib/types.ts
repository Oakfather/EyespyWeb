export interface Project {
  id: string;
  name: string;
  catalogue: CatalogueFolder;
  scenes: Scene[];
}

export interface CatalogueFolder {
  id: string;
  name: string;
  children: (CatalogueFolder | CatalogueImage)[];
}

export interface CatalogueImage {
  id: string;
  name: string;
  blobKey: string;
  folderPath: string;
  width: number;
  height: number;
  thumbnailDataUrl: string;
}

export type DetectionMode = 'center' | 'revealFull';

export interface Scene {
  id: string;
  name: string;
  backgroundImageId: string | null;
  foregroundTint: string;
  foregroundTintOpacity: number;
  foregroundImageId: string | null;
  hiddenEntries: HiddenImageEntry[];
  revealShape: RevealShapeConfig;
  revealThreshold: number;
  detectionMode: DetectionMode;
  revealWindow: number; // seconds, used by revealFull mode
}

export interface HiddenImageEntry {
  id: string;
  catalogueImageId: string;
  scaleRange: [number, number];
  allowedRegion: Rect | null;
  rotation: number;
}

export interface RevealShapeConfig {
  type: 'circle' | 'cone' | 'rect' | 'custom';
  size: number;
  falloff: number;
  customPath?: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function isCatalogueImage(
  item: CatalogueFolder | CatalogueImage
): item is CatalogueImage {
  return 'blobKey' in item;
}

export function isCatalogueFolder(
  item: CatalogueFolder | CatalogueImage
): item is CatalogueFolder {
  return 'children' in item;
}
