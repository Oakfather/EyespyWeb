<script lang="ts">
  import { getCurrentScene } from '$lib/stores/editorStore.svelte';
  import { findCatalogueImage } from '$lib/stores/projectStore.svelte';
  import { renderEditorPreview } from '$lib/canvas/scenePreviewer';

  const scene = $derived(getCurrentScene());
  let canvasEl: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = null;

  // Track scene changes to trigger re-render
  const sceneJson = $derived(scene ? JSON.stringify(scene) : '');

  $effect(() => {
    if (!canvasEl) return;
    ctx = canvasEl.getContext('2d');

    const ro = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      // Use device pixel ratio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvasEl!.width = rect.width * dpr;
      canvasEl!.height = rect.height * dpr;
      canvasEl!.style.width = `${rect.width}px`;
      canvasEl!.style.height = `${rect.height}px`;
      ctx?.scale(dpr, dpr);
      redraw();
    });
    ro.observe(canvasEl.parentElement!);
    return () => ro.disconnect();
  });

  // Re-render when scene data changes
  $effect(() => {
    // Touch sceneJson to register dependency
    void sceneJson;
    redraw();
  });

  function redraw() {
    if (!ctx || !scene) return;
    // Reset transform before rendering (ResizeObserver sets dpr scale)
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderEditorPreview(ctx, scene, findCatalogueImage);
  }
</script>

<div class="canvas-panel">
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .canvas-panel {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    background: #12121e;
  }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>
