import type { TutorialStep } from '../types';

export const editorSteps: TutorialStep[] = [
  {
    selector: '.topbar',
    title: 'Toolbar',
    description: 'Navigate back to home, rename your scene, export it as a zip, or launch play mode.',
    placement: 'bottom',
  },
  {
    selector: '.scene-name-input',
    title: 'Scene Name',
    description: 'Click to rename your scene — the name is saved automatically when you leave the field.',
    placement: 'bottom',
  },
  {
    selector: '.catalogue-panel',
    title: 'Image Catalogue',
    description: 'Add images to your catalogue, then drag them onto the canvas as background or hidden objects.',
    placement: 'right',
  },
  {
    selector: '.canvas-panel',
    title: 'Scene Preview',
    description: 'This canvas shows a live preview of your scene — drag hidden images to position them.',
    placement: 'bottom',
  },
  {
    selector: '.settings-panel',
    title: 'Scene Settings',
    description: 'Adjust background, foreground tint, reveal shape, and other scene-level options here.',
    placement: 'left',
  },
  {
    selector: 'button.play-btn',
    title: 'Launch Play Mode',
    description: 'Test your scene in play mode to experience it exactly as players will.',
    placement: 'bottom',
  },
];
