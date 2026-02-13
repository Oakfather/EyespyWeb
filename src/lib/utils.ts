import type { CatalogueFolder, CatalogueImage } from './types';
import { isCatalogueImage, isCatalogueFolder } from './types';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_FILE_SIZE } from './constants';

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `Unsupported image type: ${file.type}. Use PNG, JPG, or WebP.` };
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `Image too large (${mb} MB). Max is 10 MB.` };
  }
  return { valid: true };
}

export function findInCatalogue(
  root: CatalogueFolder,
  id: string
): CatalogueImage | CatalogueFolder | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    if (child.id === id) return child;
    if (isCatalogueFolder(child)) {
      const found = findInCatalogue(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function flattenImages(root: CatalogueFolder): CatalogueImage[] {
  const result: CatalogueImage[] = [];
  for (const child of root.children) {
    if (isCatalogueImage(child)) {
      result.push(child);
    } else if (isCatalogueFolder(child)) {
      result.push(...flattenImages(child));
    }
  }
  return result;
}

export function findParentFolder(
  root: CatalogueFolder,
  childId: string
): CatalogueFolder | null {
  for (const child of root.children) {
    if (child.id === childId) return root;
    if (isCatalogueFolder(child)) {
      const found = findParentFolder(child, childId);
      if (found) return found;
    }
  }
  return null;
}

export function findFolderById(
  root: CatalogueFolder,
  folderId: string
): CatalogueFolder | null {
  if (root.id === folderId) return root;
  for (const child of root.children) {
    if (isCatalogueFolder(child)) {
      const found = findFolderById(child, folderId);
      if (found) return found;
    }
  }
  return null;
}
