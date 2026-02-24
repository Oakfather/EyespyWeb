import { getScene, updateScene, saveCurrentProject, findCatalogueImage } from './projectStore.svelte';
import { uid } from '../uid';
import { AUTOSAVE_DEBOUNCE_MS } from '../constants';
import type { Scene, HiddenImageEntry, DetectionMode } from '../types';

let currentSceneId = $state<string | null>(null);

export function getCurrentScene(): Scene | undefined {
  if (!currentSceneId) return undefined;
  return getScene(currentSceneId);
}

export function openScene(sceneId: string): void {
  currentSceneId = sceneId;
}

// --- Scene property setters ---

export function setSceneName(name: string): void {
  const scene = getCurrentScene();
  if (scene) {
    scene.name = name;
    scheduleSave();
  }
}

export function setBackground(catalogueImageId: string): void {
  const scene = getCurrentScene();
  if (scene) {
    scene.backgroundImageId = catalogueImageId;
    scheduleSave();
  }
}

export function clearBackground(): void {
  const scene = getCurrentScene();
  if (scene) {
    scene.backgroundImageId = null;
    scheduleSave();
  }
}

export function setForegroundTint(color: string): void {
  const scene = getCurrentScene();
  if (scene) {
    scene.foregroundTint = color;
    scheduleSave();
  }
}

export function setForegroundTintOpacity(opacity: number): void {
  const scene = getCurrentScene();
  if (scene) {
    scene.foregroundTintOpacity = opacity;
    scheduleSave();
  }
}

export function setForegroundImage(catalogueImageId: string | null): void {
  const scene = getCurrentScene();
  if (scene) {
    scene.foregroundImageId = catalogueImageId;
    scheduleSave();
  }
}

export function setDetectionMode(mode: DetectionMode): void {
  const scene = getCurrentScene();
  if (scene) {
    scene.detectionMode = mode;
    scheduleSave();
  }
}

export function setRevealWindow(seconds: number): void {
  const scene = getCurrentScene();
  if (scene) {
    scene.revealWindow = seconds;
    scheduleSave();
  }
}

export function addHiddenEntry(catalogueImageId: string): void {
  const scene = getCurrentScene();
  if (!scene) return;
  const entry: HiddenImageEntry = {
    id: uid(),
    catalogueImageId,
    scaleRange: [0.8, 1.2],
    allowedRegion: null,
    rotation: 0,
    vfxConfig: { growScale: 1.4, wiggleAngle: 12, duration: 700 },
  };
  scene.hiddenEntries.push(entry);
  scheduleSave();
}

export function removeHiddenEntry(entryId: string): void {
  const scene = getCurrentScene();
  if (!scene) return;
  scene.hiddenEntries = scene.hiddenEntries.filter((e) => e.id !== entryId);
  scheduleSave();
}

export function updateHiddenEntry(
  entryId: string,
  changes: Partial<HiddenImageEntry>
): void {
  const scene = getCurrentScene();
  if (!scene) return;
  const entry = scene.hiddenEntries.find((e) => e.id === entryId);
  if (entry) {
    Object.assign(entry, changes);
    scheduleSave();
  }
}

// --- Auto-save ---

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveCurrentProject();
    saveTimer = null;
  }, AUTOSAVE_DEBOUNCE_MS);
}

export function flushSave(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    saveCurrentProject();
  }
}
