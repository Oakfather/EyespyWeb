<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    onDropImage,
    onDropFiles,
    label = 'Drop here',
    children,
  }: {
    onDropImage?: (catalogueImageId: string) => void;
    onDropFiles?: (files: File[]) => void;
    label?: string;
    children?: Snippet;
  } = $props();

  let dragOver = $state(false);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;

    // Check for catalogue image ID first
    const imageId = e.dataTransfer?.getData('text/plain');
    if (imageId && onDropImage) {
      onDropImage(imageId);
      return;
    }

    // Check for file drops
    if (e.dataTransfer?.files?.length && onDropFiles) {
      onDropFiles(Array.from(e.dataTransfer.files));
    }
  }
</script>

<div
  class="drop-zone"
  class:drag-over={dragOver}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="button"
  tabindex="0"
>
  {#if children}
    {@render children()}
  {:else}
    <span class="drop-label">{label}</span>
  {/if}
</div>

<style>
  .drop-zone {
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    transition: border-color 0.15s, background 0.15s;
  }

  .drop-zone.drag-over {
    border-color: var(--accent);
    background: rgba(124, 111, 245, 0.08);
  }

  .drop-label {
    color: var(--text-secondary);
    font-size: 12px;
  }
</style>
