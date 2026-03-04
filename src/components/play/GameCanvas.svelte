<script lang="ts">
  import type { Scene } from '$lib/types';
  import { findCatalogueImage } from '$lib/stores/projectStore.svelte';
  import { imageCache } from '$lib/images/imageCache';
  import { coverToViewport } from '$lib/canvas/canvasUtils';
  import { renderFrame, type RenderState, type PlacedImageRender } from '$lib/canvas/renderPipeline';
  import { placeHiddenImages, type PlacedImage } from '$lib/game/placementEngine';
  import { checkDetection, resetDwellTimers } from '$lib/game/detectionEngine';
  import { GameLoop } from '$lib/game/gameLoop';
  import { InputHandler } from '$lib/game/inputHandler';

  let {
    scene,
    revealSize = $bindable(80),
    onFoundUpdate,
    onComplete,
  }: {
    scene: Scene;
    revealSize: number;
    onFoundUpdate: (found: number, total: number, elapsed: number) => void;
    onComplete: () => void;
  } = $props();

  let canvasEl: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = null;
  let displayWidth = $state(0);
  let displayHeight = $state(0);

  let placedImages: PlacedImage[] = [];
  let loadedImages = new Map<string, HTMLImageElement>();
  let bgImage: HTMLImageElement | null = null;
  let fgImage: HTMLImageElement | null = null;
  let elapsed = 0;
  let complete = false;

  const input = new InputHandler();
  let gameLoop: GameLoop | null = null;

  export function restart(): void {
    initGame();
  }

  let initPending = false;

  $effect(() => {
    if (!canvasEl) return;
    ctx = canvasEl.getContext('2d');
    input.attach(canvasEl);
    initPending = true;

    const ro = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      displayWidth = rect.width;
      displayHeight = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvasEl!.width = rect.width * dpr;
      canvasEl!.height = rect.height * dpr;
      canvasEl!.style.width = `${rect.width}px`;
      canvasEl!.style.height = `${rect.height}px`;
      // Init game once we have real dimensions
      if (initPending && rect.width > 0 && rect.height > 0) {
        initPending = false;
        initGame();
      }
    });
    ro.observe(canvasEl.parentElement!);

    return () => {
      gameLoop?.stop();
      input.detach();
      ro.disconnect();
    };
  });

  async function initGame(): Promise<void> {
    gameLoop?.stop();
    complete = false;
    elapsed = 0;
    resetDwellTimers();

    // Load images
    bgImage = null;
    fgImage = null;
    loadedImages.clear();

    if (scene.backgroundImageId) {
      const info = findCatalogueImage(scene.backgroundImageId);
      if (info) {
        try { bgImage = await imageCache.get(info.blobKey); } catch {}
      }
    }

    if (scene.foregroundImageId) {
      const info = findCatalogueImage(scene.foregroundImageId);
      if (info) {
        try { fgImage = await imageCache.get(info.blobKey); } catch {}
      }
    }

    // Place hidden images within the full canvas bounds
    placedImages = placeHiddenImages(
      scene.hiddenEntries,
      displayWidth,
      displayHeight,
      findCatalogueImage
    );

    // Preload all hidden image HTMLImageElements
    for (const p of placedImages) {
      const info = findCatalogueImage(p.catalogueImageId);
      if (info && !loadedImages.has(p.blobKey)) {
        try {
          const img = await imageCache.get(info.blobKey);
          loadedImages.set(p.blobKey, img);
        } catch {}
      }
    }

    onFoundUpdate(0, placedImages.length, 0);

    // Start loop
    gameLoop = new GameLoop(update, render);
    gameLoop.start();
  }

  function update(dt: number): void {
    if (complete) return;
    elapsed += dt;

    if (input.isActive) {
      const found = checkDetection(
        input.x,
        input.y,
        revealSize,
        placedImages,
        scene.revealThreshold,
        dt,
        scene.detectionMode ?? 'center',
        scene.revealWindow ?? 3
      );

      if (found.length > 0) {
        const foundCount = placedImages.filter((p) => p.found).length;
        onFoundUpdate(foundCount, placedImages.length, elapsed);

        if (foundCount === placedImages.length) {
          complete = true;
          onComplete();
        }
      }
    }

    // Always update elapsed in HUD
    const foundCount = placedImages.filter((p) => p.found).length;
    onFoundUpdate(foundCount, placedImages.length, elapsed);
  }

  function render(): void {
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bgW = bgImage?.naturalWidth || 800;
    const bgH = bgImage?.naturalHeight || 600;
    const bgFit = coverToViewport(displayWidth, displayHeight, bgW, bgH);

    const hiddenRenders: PlacedImageRender[] = placedImages.map((p) => {
      const entry = scene.hiddenEntries.find((e) => e.id === p.entryId);
      const vfx = entry?.vfxConfig ?? { growScale: 1.4, wiggleAngle: 12, duration: 700 };
      return {
        image: loadedImages.get(p.blobKey)!,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        found: p.found,
        foundTime: p.foundTime,
        vfxGrowScale: vfx.growScale,
        vfxWiggleAngle: vfx.wiggleAngle,
        vfxDuration: vfx.duration,
      };
    }).filter((p) => p.image);

    const state: RenderState = {
      backgroundImage: bgImage,
      backgroundFit: bgFit,
      hiddenImages: hiddenRenders,
      foregroundTint: scene.foregroundTint,
      foregroundTintOpacity: scene.foregroundTintOpacity,
      foregroundImage: fgImage,
      revealShape: { ...scene.revealShape, size: revealSize },
      revealX: input.x,
      revealY: input.y,
      revealActive: input.isActive,
      canvasWidth: displayWidth,
      canvasHeight: displayHeight,
      allFound: complete,
    };

    renderFrame(ctx, state);
  }
</script>

<div class="game-canvas-wrapper">
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .game-canvas-wrapper {
    position: absolute;
    inset: 0;
    cursor: none;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
