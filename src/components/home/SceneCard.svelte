<script lang="ts">
  import type { Scene } from '$lib/types';

  let { scene, onclick }: { scene: Scene; onclick: () => void } = $props();
</script>

<button class="scene-card" onclick={onclick}>
  <div class="scene-preview">
    <span class="scene-icon">&#128065;</span>
  </div>
  <div class="scene-name">{scene.name}</div>
  <div class="scene-meta">{scene.hiddenEntries.length} hidden images</div>
</button>

<style>
  .scene-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color 0.15s;
    text-align: left;
  }

  .scene-card:hover {
    border-color: var(--accent);
  }

  .scene-preview {
    aspect-ratio: 16 / 10;
    background: #16162a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scene-icon {
    font-size: 32px;
    opacity: 0.3;
  }

  .scene-name {
    padding: 8px 10px 2px;
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .scene-meta {
    padding: 2px 10px 8px;
    font-size: 11px;
    color: var(--text-secondary);
  }
</style>
