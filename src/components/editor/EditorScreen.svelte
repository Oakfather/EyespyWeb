<script lang="ts">
  import { openScene } from '$lib/stores/editorStore.svelte';
  import TopBar from './TopBar.svelte';
  import CataloguePanel from './CataloguePanel.svelte';
  import CanvasPanel from './CanvasPanel.svelte';
  import SettingsPanel from './SettingsPanel.svelte';

  let { sceneId }: { sceneId: string } = $props();

  $effect(() => {
    openScene(sceneId);
  });
</script>

<div class="editor-layout">
  <TopBar {sceneId} />
  <div class="editor-panels">
    <CataloguePanel />
    <CanvasPanel />
    <SettingsPanel />
  </div>
</div>

<style>
  .editor-layout {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .editor-panels {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
</style>
