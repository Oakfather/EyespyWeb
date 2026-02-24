import { saveImageBlob } from '../storage/imageRepository';
import { generateThumbnail } from '../images/thumbnailGenerator';
import { uid } from '../uid';
import type { Project, CatalogueImage, CatalogueFolder, Scene, HiddenImageEntry } from '../types';

const BACKGROUND_PATH = './resources/default/french_lanscape.png';
const HIDDEN_PATHS = [
  './resources/default/character_study.PNG',
  './resources/default/duck_decoy.PNG',
  './resources/default/london_character.PNG',
];

async function fetchAsFile(path: string): Promise<File | null> {
  try {
    const resp = await fetch(path);
    if (!resp.ok) {
      console.error(`[example] fetch failed for ${path}: ${resp.status} ${resp.statusText}`);
      return null;
    }
    const blob = await resp.blob();
    const name = path.split('/').pop()!;
    // Derive type from extension if blob.type is empty
    let type = blob.type;
    if (!type || type === 'application/octet-stream') {
      const ext = name.split('.').pop()?.toLowerCase();
      type = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
    }
    return new File([blob], name, { type });
  } catch (err) {
    console.error(`[example] fetch error for ${path}:`, err);
    return null;
  }
}

async function addToFolder(folder: CatalogueFolder, file: File): Promise<CatalogueImage | null> {
  try {
    const blobKey = uid();
    const { dataUrl, width, height } = await generateThumbnail(file);
    await saveImageBlob(blobKey, file);
    const image: CatalogueImage = {
      id: uid(),
      name: file.name,
      blobKey,
      folderPath: folder.name,
      width,
      height,
      thumbnailDataUrl: dataUrl,
    };
    folder.children.push(image);
    return image;
  } catch (err) {
    console.error(`[example] failed to add ${file.name}:`, err);
    return null;
  }
}

export async function initExampleContent(project: Project): Promise<void> {
  console.log('[example] initialising example content...');

  const folder: CatalogueFolder = { id: uid(), name: 'Default', children: [] };
  project.catalogue.children.push(folder);

  const bgFile = await fetchAsFile(BACKGROUND_PATH);
  if (!bgFile) console.warn('[example] background image could not be loaded');
  const bgImage = bgFile ? await addToFolder(folder, bgFile) : null;

  const hiddenImages: CatalogueImage[] = [];
  for (const path of HIDDEN_PATHS) {
    const file = await fetchAsFile(path);
    if (file) {
      const img = await addToFolder(folder, file);
      if (img) hiddenImages.push(img);
    }
  }

  console.log(`[example] loaded bg: ${!!bgImage}, hidden: ${hiddenImages.length}`);

  const hiddenEntries: HiddenImageEntry[] = hiddenImages.map((img) => ({
    id: uid(),
    catalogueImageId: img.id,
    scaleRange: [0.8, 1.2] as [number, number],
    allowedRegion: null,
    rotation: 0,
    vfxConfig: { growScale: 1.4, wiggleAngle: 12, duration: 700 },
  }));

  const scene: Scene = {
    id: uid(),
    name: 'French Countryside',
    backgroundImageId: bgImage?.id ?? null,
    foregroundTint: '#000000',
    foregroundTintOpacity: 1.0,
    foregroundImageId: null,
    hiddenEntries,
    revealShape: { type: 'circle', size: 80, falloff: 0.3 },
    revealThreshold: 0.5,
    detectionMode: 'center',
    revealWindow: 3,
  };

  project.scenes.push(scene);
  console.log('[example] scene created:', scene.name);
}
