<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import { getCurrentScene, setSceneName, flushSave } from '$lib/stores/editorStore.svelte';

  let { sceneId }: { sceneId: string } = $props();
  const scene = $derived(getCurrentScene());

  function handleBack() {
    flushSave();
    navigate('home');
  }

  function handlePlay() {
    flushSave();
    navigate('play', sceneId);
  }

  function handleNameChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value.trim()) {
      setSceneName(value.trim());
    }
  }
</script>

<div class="topbar">
  <button class="topbar-btn" onclick={handleBack}>
    &larr; Back
  </button>

  {#if scene}
    <input
      class="scene-name-input"
      value={scene.name}
      onchange={handleNameChange}
      onblur={handleNameChange}
    />
  {/if}

  <button class="topbar-btn play-btn" onclick={handlePlay}>
    &#9654; Play
  </button>
</div>

<style>
  .topbar {
    display: flex;
    align-items: center;
    height: var(--topbar-height);
    padding: 0 12px;
    background: var(--surface-bg);
    border-bottom: 1px solid var(--border);
    gap: 12px;
  }

  .topbar-btn {
    padding: 6px 12px;
    border-radius: var(--radius);
    font-size: 13px;
    background: var(--panel-bg);
    border: 1px solid var(--border);
    white-space: nowrap;
  }

  .topbar-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .play-btn {
    margin-left: auto;
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .play-btn:hover {
    background: var(--accent-hover);
    color: white;
  }

  .scene-name-input {
    flex: 1;
    text-align: center;
    font-weight: 600;
    font-size: 14px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius);
    padding: 4px 8px;
  }

  .scene-name-input:hover {
    border-color: var(--border);
  }

  .scene-name-input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--panel-bg);
  }
</style>
