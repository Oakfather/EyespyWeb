<script lang="ts">
  import type { HiddenImageEntry } from '$lib/types';
  import { findCatalogueImage } from '$lib/stores/projectStore.svelte';
  import { updateHiddenEntry } from '$lib/stores/editorStore.svelte';

  let { entry }: { entry: HiddenImageEntry } = $props();

  const image = $derived(findCatalogueImage(entry.catalogueImageId));
  let expanded = $state(false);
  let vfxExpanded = $state(false);

  const vfx = $derived(entry.vfxConfig ?? { growScale: 1.4, wiggleAngle: 12, duration: 700 });

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

  function setVfxGrow(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    updateHiddenEntry(entry.id, { vfxConfig: { ...vfx, growScale: val } });
  }

  function setVfxWiggle(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    updateHiddenEntry(entry.id, { vfxConfig: { ...vfx, wiggleAngle: val } });
  }

  function setVfxDuration(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    updateHiddenEntry(entry.id, { vfxConfig: { ...vfx, duration: val } });
  }
</script>

<div class="entry-item">
  <div class="entry-row">
    <button class="expand-btn" onclick={() => expanded = !expanded} title="Placement settings">
      {expanded ? '\u25BE' : '\u25B8'}
    </button>
    {#if image}
      <img class="entry-thumb" src={image.thumbnailDataUrl} alt={image.name} />
      <span class="entry-name">{image.name}</span>
    {:else}
      <span class="entry-name missing">Missing image</span>
    {/if}
    <button
      class="vfx-btn"
      class:active={vfxExpanded}
      onclick={() => vfxExpanded = !vfxExpanded}
      title="VFX settings"
    >✨</button>
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

  {#if vfxExpanded}
    <div class="vfx-details">
      <div class="vfx-header">Found VFX</div>
      <div class="detail-row">
        <label class="detail-label">Grow</label>
        <input
          type="range"
          min="1"
          max="2.5"
          step="0.05"
          value={vfx.growScale}
          oninput={setVfxGrow}
          class="slider"
        />
        <span class="detail-value">{vfx.growScale.toFixed(2)}×</span>
      </div>
      <div class="detail-row">
        <label class="detail-label">Wiggle</label>
        <input
          type="range"
          min="0"
          max="45"
          step="1"
          value={vfx.wiggleAngle}
          oninput={setVfxWiggle}
          class="slider"
        />
        <span class="detail-value">{vfx.wiggleAngle}&deg;</span>
      </div>
      <div class="detail-row">
        <label class="detail-label">Duration</label>
        <input
          type="range"
          min="100"
          max="1500"
          step="50"
          value={vfx.duration}
          oninput={setVfxDuration}
          class="slider"
        />
        <span class="detail-value">{vfx.duration}ms</span>
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
    flex-shrink: 0;
  }

  .entry-thumb {
    width: 28px;
    height: 28px;
    object-fit: contain;
    border-radius: 3px;
    background: #16162a;
    flex-shrink: 0;
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

  .vfx-btn {
    font-size: 13px;
    padding: 1px 4px;
    border-radius: 3px;
    opacity: 0.4;
    transition: opacity 0.1s, background 0.1s;
    flex-shrink: 0;
  }

  .entry-row:hover .vfx-btn {
    opacity: 0.8;
  }

  .vfx-btn.active {
    opacity: 1;
    background: rgba(123, 97, 255, 0.15);
  }

  .entry-details {
    padding: 6px 8px 8px 28px;
    border-top: 1px solid var(--border);
    background: var(--panel-bg);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .vfx-details {
    padding: 6px 8px 8px 10px;
    border-top: 1px solid var(--border);
    background: var(--panel-bg);
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .vfx-header {
    font-size: 10px;
    font-weight: 600;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .detail-label {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 55px;
  }

  .detail-value {
    font-size: 10px;
    color: var(--text-secondary);
    min-width: 36px;
    text-align: right;
  }

  .slider {
    flex: 1;
    accent-color: var(--accent);
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
