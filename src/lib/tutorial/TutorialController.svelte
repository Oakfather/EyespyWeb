<script lang="ts">
  import type { TutorialScreen, TutorialStep } from './types';
  import { isTutorialComplete, markTutorialComplete } from './tutorialState';
  import { homeSteps } from './steps/home';
  import { editorSteps } from './steps/editor';
  import { playSteps } from './steps/play';
  import TutorialOverlay from '../../components/shared/TutorialOverlay.svelte';

  let { screen }: { screen: TutorialScreen } = $props();

  const stepMap: Record<TutorialScreen, TutorialStep[]> = {
    home: homeSteps,
    editor: editorSteps,
    play: playSteps,
  };

  const steps = $derived(stepMap[screen]);

  let active = $state(false);
  let stepIndex = $state(0);
  let highlightRect = $state<DOMRect | null>(null);

  $effect(() => {
    if (!isTutorialComplete(screen)) {
      active = true;
      stepIndex = 0;
    }
  });

  const currentStep = $derived(steps[stepIndex] ?? null);

  $effect(() => {
    if (!active || !currentStep) return;
    const sel = currentStep.selector;
    if (!sel) {
      highlightRect = null;
      return;
    }
    const el = document.querySelector(sel);
    if (!el) {
      // Skip steps whose target element doesn't exist
      advance();
      return;
    }
    highlightRect = el.getBoundingClientRect();
  });

  function advance() {
    if (stepIndex >= steps.length - 1) {
      markTutorialComplete(screen);
      active = false;
    } else {
      stepIndex++;
    }
  }

  function retreat() {
    if (stepIndex > 0) stepIndex--;
  }

  function skip() {
    markTutorialComplete(screen);
    active = false;
  }
</script>

{#if active && currentStep}
  <TutorialOverlay
    step={currentStep}
    {highlightRect}
    stepNumber={stepIndex + 1}
    totalSteps={steps.length}
    isFirst={stepIndex === 0}
    isLast={stepIndex === steps.length - 1}
    onNext={advance}
    onPrev={retreat}
    onSkip={skip}
  />
{/if}
