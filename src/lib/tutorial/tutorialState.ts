import type { TutorialScreen } from './types';

const KEYS: Record<TutorialScreen, string> = {
  home: 'eyespy:tutorial:home',
  editor: 'eyespy:tutorial:editor',
  play: 'eyespy:tutorial:play',
};

const completed: Record<TutorialScreen, boolean> = {
  home: localStorage.getItem(KEYS.home) === 'true',
  editor: localStorage.getItem(KEYS.editor) === 'true',
  play: localStorage.getItem(KEYS.play) === 'true',
};

export function isTutorialComplete(screen: TutorialScreen): boolean {
  return completed[screen];
}

export function markTutorialComplete(screen: TutorialScreen): void {
  completed[screen] = true;
  localStorage.setItem(KEYS[screen], 'true');
}

export function resetTutorial(screen: TutorialScreen): void {
  completed[screen] = false;
  localStorage.removeItem(KEYS[screen]);
}
