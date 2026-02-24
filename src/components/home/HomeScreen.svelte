<script lang="ts">
  import { getProject, addScene, removeScene } from '$lib/stores/projectStore.svelte';
  import { navigate } from '$lib/router.svelte';
  import { importScene } from '$lib/packaging/importer';
  import SceneCard from './SceneCard.svelte';
  import NewSceneButton from './NewSceneButton.svelte';

  const project = getProject();
  let fileInput: HTMLInputElement;
  let importing = $state(false);

  function handleNewScene() {
    const scene = addScene();
    navigate('editor', scene.id);
  }

  async function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    importing = true;
    try {
      const scene = await importScene(input.files[0]);
      navigate('editor', scene.id);
    } catch (err) {
      alert(`Import failed: ${(err as Error).message}`);
    }
    importing = false;
    input.value = '';
  }
</script>

<div class="home">
  <header class="home-header">
    <h1 class="home-title">EyeSpy</h1>
    <p class="home-subtitle">{project?.name ?? 'Project'}</p>
    <button
      class="import-btn"
      onclick={() => fileInput.click()}
      disabled={importing}
    >
      {importing ? 'Importing...' : 'Import Scene (.eyespy.zip)'}
    </button>
    <input
      bind:this={fileInput}
      type="file"
      accept=".zip"
      onchange={handleImport}
      style="display:none"
    />
  </header>

  <div class="scenes-grid">
    {#if project}
      {#each project.scenes as scene (scene.id)}
        <SceneCard
          {scene}
          onPlay={() => navigate('play', scene.id)}
          onEdit={() => navigate('editor', scene.id)}
          onDelete={() => { if (confirm(`Delete "${scene.name}"?`)) removeScene(scene.id); }}
        />
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

  .import-btn {
    margin-top: 12px;
    padding: 6px 16px;
    border-radius: var(--radius);
    font-size: 13px;
    background: var(--surface-bg);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    transition: border-color 0.15s, color 0.15s;
  }

  .import-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .import-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
