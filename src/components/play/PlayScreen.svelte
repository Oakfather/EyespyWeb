<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import { getScene, findCatalogueImage } from '$lib/stores/projectStore.svelte';
  import { imageCache } from '$lib/images/imageCache';
  import GameCanvas from './GameCanvas.svelte';
  import LoadingScreen from './LoadingScreen.svelte';
  import HUD from './HUD.svelte';
  import GearMenu from './GearMenu.svelte';
  import LevelComplete from './LevelComplete.svelte';

  let { sceneId }: { sceneId: string } = $props();

  const scene = $derived(getScene(sceneId));

  let loading = $state(true);
  let loadProgress = $state(0);
  let menuOpen = $state(false);
  let isComplete = $state(false);
  let foundCount = $state(0);
  let totalCount = $state(0);
  let elapsed = $state(0);
  let revealSize = $state(80);
  let gameCanvas: GameCanvas | undefined = $state();

  $effect(() => {
    if (scene) {
      revealSize = scene.revealShape.size;
      preload();
    }
  });

  async function preload(): Promise<void> {
    if (!scene) return;
    loading = true;
    loadProgress = 0;

    const blobKeys: string[] = [];
    if (scene.backgroundImageId) {
      const img = findCatalogueImage(scene.backgroundImageId);
      if (img) blobKeys.push(img.blobKey);
    }
    if (scene.foregroundImageId) {
      const img = findCatalogueImage(scene.foregroundImageId);
      if (img) blobKeys.push(img.blobKey);
    }
    for (const entry of scene.hiddenEntries) {
      const img = findCatalogueImage(entry.catalogueImageId);
      if (img) blobKeys.push(img.blobKey);
    }

    const unique = [...new Set(blobKeys)];
    let loaded = 0;
    for (const key of unique) {
      try {
        await imageCache.get(key);
      } catch {}
      loaded++;
      loadProgress = unique.length > 0 ? loaded / unique.length : 1;
    }

    loading = false;
  }

  function handleFoundUpdate(found: number, total: number, time: number) {
    foundCount = found;
    totalCount = total;
    elapsed = time;
  }

  function handleComplete() {
    isComplete = true;
  }

  function handleRestart() {
    isComplete = false;
    menuOpen = false;
    gameCanvas?.restart();
  }

  function handleEdit() {
    navigate('editor', sceneId);
  }

  function handleHome() {
    navigate('home');
  }
</script>

<div class="play-screen">
  {#if !scene}
    <div class="error">Scene not found</div>
  {:else if loading}
    <LoadingScreen progress={loadProgress} />
  {:else}
    <GameCanvas
      bind:this={gameCanvas}
      {scene}
      bind:revealSize
      onFoundUpdate={handleFoundUpdate}
      onComplete={handleComplete}
    />

    <HUD
      {foundCount}
      {totalCount}
      {elapsed}
      onMenuOpen={() => menuOpen = true}
    />

    {#if menuOpen && !isComplete}
      <GearMenu
        {revealSize}
        onClose={() => menuOpen = false}
        onEdit={handleEdit}
        onRestart={handleRestart}
        onRevealSizeChange={(s) => revealSize = s}
      />
    {/if}

    {#if isComplete}
      <LevelComplete
        {foundCount}
        {elapsed}
        onReplay={handleRestart}
        onEdit={handleEdit}
        onHome={handleHome}
      />
    {/if}
  {/if}
</div>

<style>
  .play-screen {
    height: 100%;
    width: 100%;
    position: relative;
    background: #000;
    overflow: hidden;
  }

  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--danger);
    font-size: 16px;
  }
</style>
