<script lang="ts">
  import { getRoute } from '$lib/router.svelte';
  import { loadOrCreateProject, getProject } from '$lib/stores/projectStore.svelte';
  import HomeScreen from './components/home/HomeScreen.svelte';
  import EditorScreen from './components/editor/EditorScreen.svelte';
  import PlayScreen from './components/play/PlayScreen.svelte';

  let ready = $state(false);
  const route = getRoute();

  $effect(() => {
    loadOrCreateProject().then(() => {
      ready = true;
    });
  });
</script>

{#if !ready}
  <div class="loading">
    <div class="loading-text">Loading project...</div>
  </div>
{:else if route.screen === 'editor' && route.sceneId}
  <EditorScreen sceneId={route.sceneId} />
{:else if route.screen === 'play' && route.sceneId}
  <PlayScreen sceneId={route.sceneId} />
{:else}
  <HomeScreen />
{/if}

<style>
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .loading-text {
    color: var(--text-secondary);
    font-size: 16px;
  }
</style>
