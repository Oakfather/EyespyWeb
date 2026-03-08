export type TutorialScreen = 'home' | 'editor' | 'play';

export interface TutorialStep {
  selector: string | null;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}
