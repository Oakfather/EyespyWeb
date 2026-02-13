<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import { getScene } from '$lib/stores/projectStore.svelte';

  let { sceneId }: { sceneId: string } = $props();
  const scene = $derived(getScene(sceneId));
</script>

<div class="play-stub">
  <div class="play-header">
    <button class="back-btn" onclick={() => navigate('editor', sceneId)}>&#9881; Edit</button>
    <span>Playing: <strong>{scene?.name ?? 'Unknown'}</strong></span>
  </div>
  <div class="play-body">
    <p>Play mode coming in Phase 5</p>
  </div>
</div>

<style>
  .play-stub {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .play-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--surface-bg);
    border-bottom: 1px solid var(--border);
  }

  .back-btn {
    padding: 6px 12px;
    border-radius: var(--radius);
    font-size: 13px;
    background: var(--panel-bg);
    border: 1px solid var(--border);
  }

  .back-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .play-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }
</style>
