<script lang="ts">
  import type { CatalogueImage } from '$lib/types';

  let { image, size = 56 }: { image: CatalogueImage; size?: number } = $props();

  function handleDragStart(e: DragEvent) {
    e.dataTransfer?.setData('text/plain', image.id);
    e.dataTransfer!.effectAllowed = 'copy';
  }
</script>

<div
  class="thumbnail"
  draggable="true"
  ondragstart={handleDragStart}
  title={image.name}
  style="width: {size}px"
>
  <div class="thumb-img" style="height: {size}px">
    <img src={image.thumbnailDataUrl} alt={image.name} />
  </div>
  <div class="thumb-name">{image.name}</div>
</div>

<style>
  .thumbnail {
    display: flex;
    flex-direction: column;
    cursor: grab;
    border-radius: 4px;
    overflow: hidden;
    background: var(--panel-bg);
    border: 1px solid transparent;
    transition: border-color 0.1s;
  }

  .thumbnail:hover {
    border-color: var(--accent);
  }

  .thumbnail:active {
    cursor: grabbing;
  }

  .thumb-img {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #16162a;
    overflow: hidden;
  }

  .thumb-img img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .thumb-name {
    font-size: 10px;
    padding: 2px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-secondary);
    text-align: center;
  }
</style>
