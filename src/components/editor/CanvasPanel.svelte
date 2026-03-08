<script lang="ts">
  import { getCurrentScene } from '$lib/stores/editorStore.svelte';
  import { findCatalogueImage } from '$lib/stores/projectStore.svelte';
  import { renderEditorPreview, type PreviewPlacement } from '$lib/canvas/scenePreviewer';

  const scene = $derived(getCurrentScene());
  let canvasEl: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = null;

  // Preview placements: entryId → placement (normalized within bgFit)
  let placements = $state<Record<string, PreviewPlacement>>({});
  // Incrementing counter to trigger redraws when placements change
  let placementVersion = $state(0);

  // Track hidden entry IDs to detect additions/removals
  const entryKey = $derived(scene?.hiddenEntries.map(e => e.id).join(',') ?? '');

  $effect(() => {
    void entryKey;
    if (!scene) return;

    let changed = false;
    const next = { ...placements };

    // Remove entries that no longer exist
    for (const id of Object.keys(next)) {
      if (!scene.hiddenEntries.find(e => e.id === id)) {
        delete next[id];
        changed = true;
      }
    }

    // Add placements for newly added entries
    const existing = Object.values(next);
    for (const entry of scene.hiddenEntries) {
      if (!next[entry.id]) {
        const imgInfo = findCatalogueImage(entry.catalogueImageId);
        if (imgInfo) {
          const p = scatter(entry.id, imgInfo.blobKey, imgInfo.width, imgInfo.height, existing);
          next[entry.id] = p;
          existing.push(p);
          changed = true;
        }
      }
    }

    if (changed) {
      placements = next;
      placementVersion++;
    }
  });

  function reroll() {
    if (!scene) return;
    const next: Record<string, PreviewPlacement> = {};
    const existing: PreviewPlacement[] = [];
    for (const entry of scene.hiddenEntries) {
      const imgInfo = findCatalogueImage(entry.catalogueImageId);
      if (imgInfo) {
        const p = scatter(entry.id, imgInfo.blobKey, imgInfo.width, imgInfo.height, existing);
        next[entry.id] = p;
        existing.push(p);
      }
    }
    placements = next;
    placementVersion++;
  }

  /** Compute a normalized placement within bgFit, avoiding overlaps with `placed`. */
  function scatter(
    entryId: string,
    blobKey: string,
    imgW: number,
    imgH: number,
    placed: PreviewPlacement[]
  ): PreviewPlacement {
    const nw = 0.13;
    const nh = Math.min(nw * (imgH / imgW), 0.22);
    const PAD = 0.02;

    let nx = Math.random() * Math.max(0, 1 - nw);
    let ny = Math.random() * Math.max(0, 1 - nh);

    for (let i = 0; i < 120; i++) {
      const tx = Math.random() * Math.max(0, 1 - nw);
      const ty = Math.random() * Math.max(0, 1 - nh);
      const overlaps = placed.some(
        p =>
          tx < p.nx + p.nw + PAD &&
          tx + nw + PAD > p.nx &&
          ty < p.ny + p.nh + PAD &&
          ty + nh + PAD > p.ny
      );
      if (!overlaps) { nx = tx; ny = ty; break; }
      nx = tx; ny = ty;
    }

    return { entryId, blobKey, nx, ny, nw, nh };
  }

  const sceneJson = $derived(scene ? JSON.stringify(scene) : '');

  $effect(() => {
    if (!canvasEl) return;
    ctx = canvasEl.getContext('2d');

    const ro = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
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

  $effect(() => {
    void sceneJson;
    void placementVersion;
    redraw();
  });

  function redraw() {
    if (!ctx || !scene) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderEditorPreview(ctx, scene, findCatalogueImage, Object.values(placements));
  }
</script>

<div class="canvas-panel">
  <canvas bind:this={canvasEl}></canvas>
  {#if scene && scene.hiddenEntries.length > 0}
    <button class="reroll-btn" onclick={reroll} title="Randomise preview positions">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Die face with 5 dots -->
        <rect x="1" y="1" width="14" height="14" rx="2.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
        <circle cx="4.5" cy="4.5" r="1.2" fill="currentColor"/>
        <circle cx="11.5" cy="4.5" r="1.2" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
        <circle cx="4.5" cy="11.5" r="1.2" fill="currentColor"/>
        <circle cx="11.5" cy="11.5" r="1.2" fill="currentColor"/>
      </svg>
    </button>
  {/if}
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

  .reroll-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--radius);
    color: rgba(255, 255, 255, 0.7);
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .reroll-btn:hover {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-color: var(--accent);
  }
</style>
