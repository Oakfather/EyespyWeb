<script lang="ts">
  import type { HiddenImageEntry } from '$lib/types';
  import { findCatalogueImage } from '$lib/stores/projectStore.svelte';
  import { updateHiddenEntry } from '$lib/stores/editorStore.svelte';

  let { entry }: { entry: HiddenImageEntry } = $props();

  const image = $derived(findCatalogueImage(entry.catalogueImageId));
  let expanded = $state(false);

  function setMinScale(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    updateHiddenEntry(entry.id, { scaleRange: [val, entry.scaleRange[1]] });
  }

  function setMaxScale(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    updateHiddenEntry(entry.id, { scaleRange: [entry.scaleRange[0], val] });
  }

  function setRotation(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    updateHiddenEntry(entry.id, { rotation: val });
  }
</script>

<div class="entry-item">
  <div class="entry-row">
    <button class="expand-btn" onclick={() => expanded = !expanded}>
      {expanded ? '\u25BE' : '\u25B8'}
    </button>
    {#if image}
      <img class="entry-thumb" src={image.thumbnailDataUrl} alt={image.name} />
      <span class="entry-name">{image.name}</span>
    {:else}
      <span class="entry-name missing">Missing image</span>
    {/if}
  </div>

  {#if expanded}
    <div class="entry-details">
      <div class="detail-row">
        <label class="detail-label">Scale range</label>
        <div class="scale-inputs">
          <input
            type="number"
            value={entry.scaleRange[0]}
            oninput={setMinScale}
            min="0.1"
            max="5"
            step="0.1"
            class="num-input"
          />
          <span class="range-sep">to</span>
          <input
            type="number"
            value={entry.scaleRange[1]}
            oninput={setMaxScale}
            min="0.1"
            max="5"
            step="0.1"
            class="num-input"
          />
        </div>
      </div>
      <div class="detail-row">
        <label class="detail-label">Rotation (&deg;)</label>
        <input
          type="number"
          value={entry.rotation}
          oninput={setRotation}
          min="0"
          max="360"
          step="5"
          class="num-input"
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .entry-item {
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
  }

  .entry-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
  }

  .expand-btn {
    font-size: 10px;
    color: var(--text-secondary);
    width: 16px;
    padding: 0;
  }

  .entry-thumb {
    width: 28px;
    height: 28px;
    object-fit: contain;
    border-radius: 3px;
    background: #16162a;
  }

  .entry-name {
    flex: 1;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .entry-name.missing {
    color: var(--danger);
    font-style: italic;
  }

  .entry-details {
    padding: 6px 8px 8px 28px;
    border-top: 1px solid var(--border);
    background: var(--panel-bg);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .detail-label {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 70px;
  }

  .scale-inputs {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .range-sep {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .num-input {
    width: 52px;
    padding: 2px 4px;
    border: 1px solid var(--border);
    border-radius: 3px;
    background: var(--surface-bg);
    font-size: 12px;
    text-align: center;
  }

  .num-input:focus {
    outline: none;
    border-color: var(--accent);
  }
</style>
