<script lang="ts">
  import { onMount } from 'svelte';
  import type { TutorialStep } from '$lib/tutorial/types';

  let {
    step,
    highlightRect,
    stepNumber,
    totalSteps,
    isFirst,
    isLast,
    onNext,
    onPrev,
    onSkip,
  }: {
    step: TutorialStep;
    highlightRect: DOMRect | null;
    stepNumber: number;
    totalSteps: number;
    isFirst: boolean;
    isLast: boolean;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
  } = $props();

  const GAP = 10;
  const POPOVER_W = 280;

  let popoverEl: HTMLDivElement | undefined = $state();
  let popoverTop = $state(0);
  let popoverLeft = $state(0);

  // Spotlight style
  const spotlightStyle = $derived(
    highlightRect
      ? `top:${highlightRect.top}px;left:${highlightRect.left}px;width:${highlightRect.width}px;height:${highlightRect.height}px;`
      : 'top:50%;left:50%;width:0;height:0;'
  );

  function reposition() {
    if (!popoverEl) return;
    const popoverH = popoverEl.offsetHeight || 120;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!highlightRect) {
      popoverTop = vh / 2 - popoverH / 2;
      popoverLeft = vw / 2 - POPOVER_W / 2;
      return;
    }

    const placement = step.placement ?? 'bottom';
    const centerX = highlightRect.left + highlightRect.width / 2;
    const centerY = highlightRect.top + highlightRect.height / 2;

    if (placement === 'bottom') {
      popoverTop = highlightRect.bottom + GAP;
      popoverLeft = Math.min(Math.max(centerX - POPOVER_W / 2, 8), vw - POPOVER_W - 8);
    } else if (placement === 'top') {
      popoverTop = highlightRect.top - popoverH - GAP;
      popoverLeft = Math.min(Math.max(centerX - POPOVER_W / 2, 8), vw - POPOVER_W - 8);
    } else if (placement === 'right') {
      popoverLeft = highlightRect.right + GAP;
      popoverTop = Math.min(Math.max(centerY - popoverH / 2, 8), vh - popoverH - 8);
    } else {
      // left
      popoverLeft = highlightRect.left - POPOVER_W - GAP;
      popoverTop = Math.min(Math.max(centerY - popoverH / 2, 8), vh - popoverH - 8);
    }
  }

  $effect(() => {
    // Track reactive deps
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    highlightRect; step;
    Promise.resolve().then(reposition);
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onSkip();
    else if (e.key === 'ArrowRight') onNext();
    else if (e.key === 'ArrowLeft' && !isFirst) onPrev();
  }

  onMount(() => {
    window.addEventListener('resize', reposition);
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<!-- Spotlight cutout: box-shadow dims everything outside -->
<div class="spotlight" style={spotlightStyle}></div>

<!-- Popover modal -->
<div
  bind:this={popoverEl}
  class="popover"
  style="top:{popoverTop}px;left:{popoverLeft}px;"
>
  <div class="popover-header">
    <span class="popover-title">{step.title}</span>
    <span class="popover-counter">{stepNumber} / {totalSteps}</span>
  </div>
  <p class="popover-body">{step.description}</p>
  <div class="popover-footer">
    <button class="btn-skip" onclick={onSkip}>Skip</button>
    <div class="popover-nav">
      {#if !isFirst}
        <button class="btn-nav" onclick={onPrev}>← Prev</button>
      {/if}
      <button class="btn-primary" onclick={onNext}>
        {isLast ? 'Finish' : 'Next →'}
      </button>
    </div>
  </div>
</div>

<style>
  .spotlight {
    position: fixed;
    pointer-events: none;
    border-radius: var(--radius);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.72);
    z-index: 999;
    transition: top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease;
  }

  .popover {
    position: fixed;
    z-index: 1000;
    width: 280px;
    background: var(--surface-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .popover-title {
    font-weight: 700;
    font-size: 14px;
    color: var(--text-primary);
  }

  .popover-counter {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .popover-body {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 14px;
  }

  .popover-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .popover-nav {
    display: flex;
    gap: 6px;
  }

  .btn-skip {
    font-size: 12px;
    color: var(--text-secondary);
    padding: 4px 8px;
    border-radius: var(--radius);
    border: 1px solid transparent;
    transition: border-color 0.1s, color 0.1s;
  }

  .btn-skip:hover {
    border-color: var(--border);
    color: var(--text-primary);
  }

  .btn-nav {
    font-size: 12px;
    color: var(--text-secondary);
    padding: 4px 10px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    transition: border-color 0.1s, color 0.1s;
  }

  .btn-nav:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .btn-primary {
    font-size: 12px;
    color: white;
    padding: 4px 12px;
    border-radius: var(--radius);
    background: var(--accent);
    border: 1px solid var(--accent);
    transition: background 0.1s;
  }

  .btn-primary:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }
</style>
