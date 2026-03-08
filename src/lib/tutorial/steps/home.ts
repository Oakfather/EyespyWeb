import type { TutorialStep } from '../types';

export const homeSteps: TutorialStep[] = [
  {
    selector: '.home-title',
    title: 'Welcome to EyeSpy',
    description: 'Create hidden-object scenes, share them with friends, and challenge yourself to find everything.',
    placement: 'bottom',
  },
  {
    selector: '.scenes-grid',
    title: 'Your Scenes',
    description: 'All your scenes appear here — create, edit, play, or share them from this grid.',
    placement: 'top',
  },
  {
    selector: '.scene-card .scene-preview.playable',
    title: 'Play a Scene',
    description: 'Click the scene thumbnail to launch play mode and start hunting for hidden objects.',
    placement: 'bottom',
  },
  {
    selector: '.scene-card .edit-btn',
    title: 'Edit a Scene',
    description: 'Click the pencil icon to open the editor and modify your scene.',
    placement: 'bottom',
  },
  {
    selector: '.scene-card .delete-btn',
    title: 'Delete a Scene',
    description: 'Click the trash icon to permanently remove a scene from your project.',
    placement: 'bottom',
  },
  {
    selector: '.import-btn',
    title: 'Import a Scene',
    description: 'Import a .eyespy.zip file shared by someone else to add it to your project.',
    placement: 'bottom',
  },
  {
    selector: 'button.new-scene',
    title: 'Create a New Scene',
    description: 'Click here to start a brand new scene and open it in the editor.',
    placement: 'top',
  },
];
