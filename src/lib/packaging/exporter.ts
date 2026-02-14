import { zipSync, strToU8 } from 'fflate';
import type { Project, Scene } from '../types';
import type { PackageManifest, PackagedHiddenEntry } from './manifestSchema';
import { getImageBlob } from '../storage/imageRepository';
import { findCatalogueImage } from '../stores/projectStore.svelte';
import { MAX_PACKAGE_SIZE } from '../constants';

export async function exportScene(scene: Scene): Promise<void> {
  // Collect all unique image IDs
  const imageIds = new Set<string>();
  if (scene.backgroundImageId) imageIds.add(scene.backgroundImageId);
  if (scene.foregroundImageId) imageIds.add(scene.foregroundImageId);
  for (const entry of scene.hiddenEntries) {
    imageIds.add(entry.catalogueImageId);
  }

  // Resolve images and build file map
  const imageIdToPath = new Map<string, string>();
  const files: Record<string, Uint8Array> = {};
  const usedNames = new Set<string>();

  for (const id of imageIds) {
    const info = findCatalogueImage(id);
    if (!info) continue;

    const blob = await getImageBlob(info.blobKey);
    if (!blob) continue;

    // Generate unique filename
    let filename = sanitizeFilename(info.name);
    if (usedNames.has(filename)) {
      const ext = filename.includes('.') ? '.' + filename.split('.').pop() : '';
      const base = filename.replace(/\.[^.]+$/, '');
      let counter = 2;
      while (usedNames.has(`${base}_${counter}${ext}`)) counter++;
      filename = `${base}_${counter}${ext}`;
    }
    usedNames.add(filename);

    const relativePath = `images/${filename}`;
    imageIdToPath.set(id, relativePath);

    const arrayBuffer = await blob.arrayBuffer();
    files[relativePath] = new Uint8Array(arrayBuffer);
  }

  // Build manifest
  const manifest: PackageManifest = {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    generator: 'eyespy-editor/0.1.0',
    scene: {
      name: scene.name,
      revealShape: scene.revealShape,
      revealThreshold: scene.revealThreshold,
      foregroundTint: scene.foregroundTint,
      foregroundTintOpacity: scene.foregroundTintOpacity,
      backgroundImage: scene.backgroundImageId
        ? imageIdToPath.get(scene.backgroundImageId) ?? null
        : null,
      foregroundImage: scene.foregroundImageId
        ? imageIdToPath.get(scene.foregroundImageId) ?? null
        : null,
      hiddenEntries: scene.hiddenEntries.map(
        (e): PackagedHiddenEntry => ({
          id: e.id,
          imageFile: imageIdToPath.get(e.catalogueImageId) ?? '',
          scaleRange: e.scaleRange,
          allowedRegion: e.allowedRegion,
          rotation: e.rotation,
        })
      ),
    },
  };

  files['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));

  // Create zip
  const zipped = zipSync(files, { level: 6 });

  if (zipped.byteLength > MAX_PACKAGE_SIZE) {
    throw new Error(
      `Package too large (${(zipped.byteLength / 1024 / 1024).toFixed(1)} MB). Max is ${MAX_PACKAGE_SIZE / 1024 / 1024} MB.`
    );
  }

  // Trigger download
  const blob = new Blob([zipped], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(scene.name)}.eyespy.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/__+/g, '_');
}
