import { loadProject, saveProject, createDefaultProject, createDefaultScene } from '../storage/projectRepository';
import { saveImageBlob, deleteImageBlob } from '../storage/imageRepository';
import { initExampleContent } from '../example/initExampleContent';
import { generateThumbnail } from '../images/thumbnailGenerator';
import { validateImageFile, findFolderById, findParentFolder } from '../utils';
import { uid } from '../uid';
import type { Project, Scene, CatalogueFolder, CatalogueImage } from '../types';
import { isCatalogueImage, isCatalogueFolder } from '../types';

let project = $state<Project | null>(null);

export function getProject(): Project | null {
  return project;
}

export async function loadOrCreateProject(): Promise<void> {
  let loaded = await loadProject();
  if (!loaded) {
    loaded = createDefaultProject();
    await initExampleContent(loaded);
    await saveProject(loaded);
  }
  project = loaded;
}

export async function saveCurrentProject(): Promise<void> {
  if (project) {
    await saveProject(structuredClone($state.snapshot(project)));
  }
}

export function addScene(name?: string): Scene {
  if (!project) throw new Error('No project loaded');
  const scene = createDefaultScene(name);
  project.scenes.push(scene);
  saveCurrentProject();
  return scene;
}

export function getScene(sceneId: string): Scene | undefined {
  return project?.scenes.find((s) => s.id === sceneId);
}

export function updateScene(updated: Scene): void {
  if (!project) return;
  const idx = project.scenes.findIndex((s) => s.id === updated.id);
  if (idx >= 0) {
    project.scenes[idx] = updated;
    saveCurrentProject();
  }
}

export function removeScene(sceneId: string): void {
  if (!project) return;
  project.scenes = project.scenes.filter((s) => s.id !== sceneId);
  saveCurrentProject();
}

export function findCatalogueImage(imageId: string): CatalogueImage | null {
  if (!project) return null;
  return findImageInFolder(project.catalogue, imageId);
}

function findImageInFolder(folder: CatalogueFolder, imageId: string): CatalogueImage | null {
  for (const child of folder.children) {
    if (isCatalogueImage(child) && child.id === imageId) {
      return child;
    }
    if (isCatalogueFolder(child)) {
      const found = findImageInFolder(child, imageId);
      if (found) return found;
    }
  }
  return null;
}

// --- Catalogue operations ---

export async function addImagesToFolder(
  folderId: string,
  files: File[]
): Promise<CatalogueImage[]> {
  if (!project) throw new Error('No project loaded');
  const folder = findFolderById(project.catalogue, folderId);
  if (!folder) throw new Error(`Folder not found: ${folderId}`);

  const added: CatalogueImage[] = [];
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.warn(`Skipping ${file.name}: ${validation.error}`);
      continue;
    }

    const blobKey = uid();
    const { dataUrl, width, height } = await generateThumbnail(file);
    await saveImageBlob(blobKey, file);

    const image: CatalogueImage = {
      id: uid(),
      name: file.name,
      blobKey,
      folderPath: folder.name === 'Root' ? '' : folder.name,
      width,
      height,
      thumbnailDataUrl: dataUrl,
    };

    folder.children.push(image);
    added.push(image);
  }

  await saveCurrentProject();
  return added;
}

export async function addImagesWithFolderStructure(
  files: File[]
): Promise<void> {
  if (!project) throw new Error('No project loaded');

  // Group files by their folder path (from webkitRelativePath)
  const byFolder = new Map<string, File[]>();
  for (const file of files) {
    const relPath = (file as any).webkitRelativePath as string || '';
    const parts = relPath.split('/');
    // Remove filename, keep folder parts
    parts.pop();
    const folderPath = parts.join('/');
    if (!byFolder.has(folderPath)) byFolder.set(folderPath, []);
    byFolder.get(folderPath)!.push(file);
  }

  for (const [folderPath, folderFiles] of byFolder) {
    // Create or find folder hierarchy
    let parentFolder = project.catalogue;
    if (folderPath) {
      const parts = folderPath.split('/');
      for (const part of parts) {
        let existing = parentFolder.children.find(
          (c) => isCatalogueFolder(c) && c.name === part
        ) as CatalogueFolder | undefined;
        if (!existing) {
          existing = { id: uid(), name: part, children: [] };
          parentFolder.children.push(existing);
        }
        parentFolder = existing;
      }
    }

    await addImagesToFolder(parentFolder.id, folderFiles);
  }
}

export function addFolder(parentId: string, name: string): CatalogueFolder {
  if (!project) throw new Error('No project loaded');
  const parent = findFolderById(project.catalogue, parentId);
  if (!parent) throw new Error(`Parent folder not found: ${parentId}`);

  const folder: CatalogueFolder = { id: uid(), name, children: [] };
  parent.children.push(folder);
  saveCurrentProject();
  return folder;
}

export async function deleteImage(imageId: string): Promise<void> {
  if (!project) return;
  const image = findCatalogueImage(imageId);
  if (!image) return;

  const parent = findParentFolder(project.catalogue, imageId);
  if (parent) {
    parent.children = parent.children.filter((c) => c.id !== imageId);
  }

  await deleteImageBlob(image.blobKey);
  await saveCurrentProject();
}

export function deleteFolder(folderId: string): void {
  if (!project) return;
  const parent = findParentFolder(project.catalogue, folderId);
  if (!parent) return;

  // Recursively collect blob keys to delete
  const folder = findFolderById(project.catalogue, folderId);
  if (folder) {
    collectAndDeleteBlobs(folder);
  }

  parent.children = parent.children.filter((c) => c.id !== folderId);
  saveCurrentProject();
}

async function collectAndDeleteBlobs(folder: CatalogueFolder): Promise<void> {
  for (const child of folder.children) {
    if (isCatalogueImage(child)) {
      await deleteImageBlob(child.blobKey);
    } else if (isCatalogueFolder(child)) {
      await collectAndDeleteBlobs(child);
    }
  }
}
