import { unzipSync, strFromU8 } from 'fflate';
import type { Scene, CatalogueImage, HiddenImageEntry } from '../types';
import type { PackageManifest } from './manifestSchema';
import { validateManifest } from './manifestSchema';
import { uid } from '../uid';
import { saveImageBlob } from '../storage/imageRepository';
import { generateThumbnail } from '../images/thumbnailGenerator';
import { addImagesToFolder, getProject, saveCurrentProject } from '../stores/projectStore.svelte';
import { MAX_PACKAGE_SIZE, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_DIMENSION } from '../constants';
import { DEFAULT_FOREGROUND_TINT, DEFAULT_FOREGROUND_OPACITY, DEFAULT_REVEAL_THRESHOLD, DEFAULT_REVEAL_SIZE, DEFAULT_REVEAL_FALLOFF } from '../constants';

export async function importScene(file: File): Promise<Scene> {
  if (file.size > MAX_PACKAGE_SIZE) {
    throw new Error(
      `Package too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is ${MAX_PACKAGE_SIZE / 1024 / 1024} MB.`
    );
  }

  const buffer = await file.arrayBuffer();
  const files = unzipSync(new Uint8Array(buffer));

  // Parse manifest
  const manifestBytes = files['manifest.json'];
  if (!manifestBytes) {
    throw new Error('Missing manifest.json in package');
  }

  const manifestData = JSON.parse(strFromU8(manifestBytes));
  const validation = validateManifest(manifestData);
  if (!validation.valid) {
    throw new Error(`Invalid manifest:\n${validation.errors.join('\n')}`);
  }

  const manifest = manifestData as PackageManifest;
  const project = getProject();
  if (!project) throw new Error('No project loaded');

  // Import images and map paths to catalogue IDs
  const pathToImageId = new Map<string, string>();

  const allPaths = new Set<string>();
  if (manifest.scene.backgroundImage) allPaths.add(manifest.scene.backgroundImage);
  if (manifest.scene.foregroundImage) allPaths.add(manifest.scene.foregroundImage);
  for (const entry of manifest.scene.hiddenEntries) {
    allPaths.add(entry.imageFile);
  }

  for (const path of allPaths) {
    const imageBytes = files[path];
    if (!imageBytes) {
      console.warn(`Image not found in zip: ${path}`);
      continue;
    }

    // Detect MIME type from magic bytes
    const mime = detectMime(imageBytes);
    if (!mime) {
      console.warn(`Unknown image type for: ${path}`);
      continue;
    }

    const blob = new Blob([imageBytes], { type: mime });

    // Validate dimensions
    try {
      const bitmap = await createImageBitmap(blob);
      if (bitmap.width > MAX_IMAGE_DIMENSION || bitmap.height > MAX_IMAGE_DIMENSION) {
        console.warn(`Image too large (${bitmap.width}x${bitmap.height}): ${path}`);
        bitmap.close();
        continue;
      }
      bitmap.close();
    } catch {
      console.warn(`Failed to decode image: ${path}`);
      continue;
    }

    // Generate thumbnail and store
    const blobKey = uid();
    const { dataUrl, width, height } = await generateThumbnail(blob);
    await saveImageBlob(blobKey, blob);

    const filename = path.split('/').pop() || 'image';
    const imageId = uid();

    const catalogueImage: CatalogueImage = {
      id: imageId,
      name: filename,
      blobKey,
      folderPath: '',
      width,
      height,
      thumbnailDataUrl: dataUrl,
    };

    project.catalogue.children.push(catalogueImage);
    pathToImageId.set(path, imageId);
  }

  // Build scene
  const scene: Scene = {
    id: uid(),
    name: manifest.scene.name || 'Imported Scene',
    backgroundImageId: manifest.scene.backgroundImage
      ? pathToImageId.get(manifest.scene.backgroundImage) ?? null
      : null,
    foregroundTint: manifest.scene.foregroundTint ?? DEFAULT_FOREGROUND_TINT,
    foregroundTintOpacity: manifest.scene.foregroundTintOpacity ?? DEFAULT_FOREGROUND_OPACITY,
    foregroundImageId: manifest.scene.foregroundImage
      ? pathToImageId.get(manifest.scene.foregroundImage) ?? null
      : null,
    hiddenEntries: manifest.scene.hiddenEntries
      .filter((e) => pathToImageId.has(e.imageFile))
      .map(
        (e): HiddenImageEntry => ({
          id: uid(),
          catalogueImageId: pathToImageId.get(e.imageFile)!,
          scaleRange: e.scaleRange,
          allowedRegion: e.allowedRegion,
          rotation: e.rotation,
        })
      ),
    revealShape: manifest.scene.revealShape ?? {
      type: 'circle',
      size: DEFAULT_REVEAL_SIZE,
      falloff: DEFAULT_REVEAL_FALLOFF,
    },
    revealThreshold: manifest.scene.revealThreshold ?? DEFAULT_REVEAL_THRESHOLD,
  };

  project.scenes.push(scene);
  await saveCurrentProject();

  return scene;
}

function detectMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return 'image/webp';
  }
  return null;
}
