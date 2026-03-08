import type { TutorialStep } from '../types';

export const playSteps: TutorialStep[] = [
  {
    selector: '.game-canvas-wrapper canvas',
    title: 'The Puzzle Canvas',
    description: 'Move your mouse over the canvas to reveal hidden objects — click when you think you found one.',
    placement: 'top',
  },
  {
    selector: '.found-counter',
    title: 'Found Counter',
    description: 'Tracks how many hidden objects you have found out of the total in this scene.',
    placement: 'bottom',
  },
  {
    selector: '.timer',
    title: 'Timer',
    description: 'Your elapsed time is shown here — try to find everything as fast as you can.',
    placement: 'bottom',
  },
  {
    selector: '.gear-btn',
    title: 'Settings',
    description: 'Open settings to adjust the spotlight size, restart the scene, or return to the editor.',
    placement: 'left',
  },
];
