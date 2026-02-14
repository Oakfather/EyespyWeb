import type { RevealShapeConfig, Rect } from '../types';

export interface PackageManifest {
  formatVersion: 1;
  exportedAt: string;
  generator: string;
  scene: {
    name: string;
    revealShape: RevealShapeConfig;
    revealThreshold: number;
    foregroundTint: string;
    foregroundTintOpacity: number;
    backgroundImage: string | null;
    foregroundImage: string | null;
    hiddenEntries: PackagedHiddenEntry[];
  };
}

export interface PackagedHiddenEntry {
  id: string;
  imageFile: string;
  scaleRange: [number, number];
  allowedRegion: Rect | null;
  rotation: number;
}

export function validateManifest(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Manifest is not a valid object'] };
  }

  const m = data as Record<string, unknown>;

  if (m.formatVersion !== 1) {
    errors.push(`Unsupported format version: ${m.formatVersion} (expected 1)`);
  }

  if (typeof m.exportedAt !== 'string') {
    errors.push('Missing or invalid exportedAt timestamp');
  }

  if (!m.scene || typeof m.scene !== 'object') {
    errors.push('Missing scene definition');
    return { valid: false, errors };
  }

  const s = m.scene as Record<string, unknown>;

  if (typeof s.name !== 'string') errors.push('Missing scene name');
  if (typeof s.revealThreshold !== 'number') errors.push('Missing revealThreshold');
  if (!s.revealShape || typeof s.revealShape !== 'object') errors.push('Missing revealShape');
  if (!Array.isArray(s.hiddenEntries)) errors.push('Missing hiddenEntries array');

  if (Array.isArray(s.hiddenEntries)) {
    for (let i = 0; i < s.hiddenEntries.length; i++) {
      const e = s.hiddenEntries[i] as Record<string, unknown>;
      if (typeof e.imageFile !== 'string') {
        errors.push(`hiddenEntries[${i}]: missing imageFile`);
      }
      if (!Array.isArray(e.scaleRange) || e.scaleRange.length !== 2) {
        errors.push(`hiddenEntries[${i}]: invalid scaleRange`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
