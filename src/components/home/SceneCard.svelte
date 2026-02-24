<script lang="ts">
  import type { Scene } from '$lib/types';
  import { findCatalogueImage } from '$lib/stores/projectStore.svelte';

  let { scene, onPlay, onEdit, onDelete }: { scene: Scene; onPlay: () => void; onEdit: () => void; onDelete: () => void } = $props();

  const bgImage = $derived(
    scene.backgroundImageId ? findCatalogueImage(scene.backgroundImageId) : null
  );

  const canPlay = $derived(scene.hiddenEntries.length > 0);
</script>

<div class="scene-card">
  <!-- Preview area doubles as the Play button -->
  <button
    class="scene-preview"
    class:playable={canPlay}
    onclick={canPlay ? onPlay : onEdit}
    title={canPlay ? 'Play' : 'Edit scene to add hidden images'}
  >
    {#if bgImage}
      <img class="preview-img" src={bgImage.thumbnailDataUrl} alt={scene.name} />
      <div class="tint-overlay" style="background:{scene.foregroundTint};opacity:{scene.foregroundTintOpacity * 0.6}"></div>
    {:else}
      <span class="scene-icon">&#128065;</span>
    {/if}

    {#if canPlay}
      <div class="play-badge">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="rgba(0,0,0,0.55)"/>
          <polygon points="7,5.5 14,9 7,12.5" fill="white"/>
        </svg>
      </div>
    {:else}
      <div class="no-play-badge">No hidden images</div>
    {/if}
  </button>

  <!-- Footer row: name + edit button -->
  <div class="scene-footer">
    <div class="scene-info">
      <div class="scene-name">{scene.name}</div>
      <div class="scene-meta">{scene.hiddenEntries.length} hidden image{scene.hiddenEntries.length === 1 ? '' : 's'}</div>
    </div>
    <button class="edit-btn" onclick={onEdit} title="Edit scene">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/>
        <line x1="8" y1="4" x2="10" y2="6" stroke="currentColor" stroke-width="1.3"/>
      </svg>
    </button>
    <button class="delete-btn" onclick={onDelete} title="Delete scene">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 3.5H12M5 3.5V2.5H9V3.5M5.5 6V10.5M8.5 6V10.5M3.5 3.5L4 11.5H10L10.5 3.5H3.5Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .scene-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color 0.15s;
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
    position: relative;
    overflow: hidden;
    width: 100%;
    padding: 0;
    border-radius: 0;
  }

  .scene-preview.playable {
    cursor: pointer;
  }

  .scene-preview.playable:hover .play-badge {
    transform: scale(1.15);
  }

  .preview-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .tint-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .scene-icon {
    font-size: 32px;
    opacity: 0.3;
    position: relative;
  }

  .play-badge {
    position: absolute;
    bottom: 6px;
    right: 6px;
    transition: transform 0.15s;
    line-height: 0;
  }

  .no-play-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.55);
    color: rgba(255, 255, 255, 0.5);
    font-size: 10px;
    text-align: center;
    padding: 3px 0;
    letter-spacing: 0.3px;
  }

  .scene-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 8px 7px 10px;
  }

  .scene-info {
    flex: 1;
    min-width: 0;
  }

  .scene-name {
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .scene-meta {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 1px;
  }

  .edit-btn {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text-secondary);
    background: transparent;
    transition: border-color 0.1s, color 0.1s, background 0.1s;
  }

  .edit-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(123, 97, 255, 0.08);
  }

  .delete-btn {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text-secondary);
    background: transparent;
    transition: border-color 0.1s, color 0.1s, background 0.1s;
  }

  .delete-btn:hover {
    border-color: var(--danger);
    color: var(--danger);
    background: rgba(229, 85, 85, 0.08);
  }
</style>
