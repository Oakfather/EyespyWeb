import { getDb } from './db';
import { STORE_PROJECTS, DEFAULT_PROJECT_NAME, DEFAULT_FOREGROUND_TINT, DEFAULT_FOREGROUND_OPACITY, DEFAULT_REVEAL_THRESHOLD, DEFAULT_REVEAL_SIZE, DEFAULT_REVEAL_FALLOFF, DEFAULT_DETECTION_MODE, DEFAULT_REVEAL_WINDOW } from '../constants';
import { uid } from '../uid';
import type { Project, Scene } from '../types';

export function createDefaultProject(): Project {
  return {
    id: uid(),
    name: DEFAULT_PROJECT_NAME,
    catalogue: {
      id: uid(),
      name: 'Root',
      children: [],
    },
    scenes: [],
  };
}

export function createDefaultScene(name: string = 'New Scene'): Scene {
  return {
    id: uid(),
    name,
    backgroundImageId: null,
    foregroundTint: DEFAULT_FOREGROUND_TINT,
    foregroundTintOpacity: DEFAULT_FOREGROUND_OPACITY,
    foregroundImageId: null,
    hiddenEntries: [],
    revealShape: {
      type: 'circle',
      size: DEFAULT_REVEAL_SIZE,
      falloff: DEFAULT_REVEAL_FALLOFF,
    },
    revealThreshold: DEFAULT_REVEAL_THRESHOLD,
    detectionMode: DEFAULT_DETECTION_MODE as import('../types').DetectionMode,
    revealWindow: DEFAULT_REVEAL_WINDOW,
  };
}

export async function loadProject(): Promise<Project | undefined> {
  const db = await getDb();
  const allProjects = await db.getAll(STORE_PROJECTS);
  return allProjects[0];
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDb();
  await db.put(STORE_PROJECTS, project);
}
