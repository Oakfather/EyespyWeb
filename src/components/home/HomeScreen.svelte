<script lang="ts">
  import { getProject, addScene } from '$lib/stores/projectStore.svelte';
  import { navigate } from '$lib/router.svelte';
  import SceneCard from './SceneCard.svelte';
  import NewSceneButton from './NewSceneButton.svelte';

  const project = getProject();

  function handleNewScene() {
    const scene = addScene();
    navigate('editor', scene.id);
  }
</script>

<div class="home">
  <header class="home-header">
    <h1 class="home-title">EyeSpy</h1>
    <p class="home-subtitle">{project?.name ?? 'Project'}</p>
  </header>

  <div class="scenes-grid">
    {#if project}
      {#each project.scenes as scene (scene.id)}
        <SceneCard {scene} onclick={() => navigate('editor', scene.id)} />
      {/each}
    {/if}
    <NewSceneButton onclick={handleNewScene} />
  </div>
</div>

<style>
  .home {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow-y: auto;
  }

  .home-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .home-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--accent);
  }

  .home-subtitle {
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .scenes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }
</style>
