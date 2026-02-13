<script lang="ts">
  import { getCurrentScene, addHiddenEntry } from '$lib/stores/editorStore.svelte';
  import DropZone from '../shared/DropZone.svelte';
  import HiddenEntryItem from './HiddenEntryItem.svelte';

  const scene = $derived(getCurrentScene());

  function handleDropImage(imageId: string) {
    addHiddenEntry(imageId);
  }
</script>

<div class="hidden-list">
  <div class="section-header">
    <span class="section-label">Hidden Images</span>
    {#if scene}
      <span class="count-badge">{scene.hiddenEntries.length}</span>
    {/if}
  </div>

  <DropZone onDropImage={handleDropImage} label="Drop image from catalogue to add">
  </DropZone>

  {#if scene}
    <div class="entries">
      {#each scene.hiddenEntries as entry (entry.id)}
        <HiddenEntryItem {entry} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .hidden-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .section-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .count-badge {
    font-size: 10px;
    background: var(--accent);
    color: white;
    padding: 1px 6px;
    border-radius: 8px;
    font-weight: 600;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
