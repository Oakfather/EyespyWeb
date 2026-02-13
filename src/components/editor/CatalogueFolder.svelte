<script lang="ts">
  import type { CatalogueFolder, CatalogueImage } from '$lib/types';
  import { isCatalogueImage, isCatalogueFolder } from '$lib/types';
  import { deleteImage, deleteFolder } from '$lib/stores/projectStore.svelte';
  import ImageThumbnail from '../shared/ImageThumbnail.svelte';

  let { folder, depth = 0 }: { folder: CatalogueFolder; depth?: number } = $props();

  let open = $state(true);

  function toggle() {
    open = !open;
  }

  function handleDeleteFolder() {
    if (confirm(`Delete folder "${folder.name}" and all its contents?`)) {
      deleteFolder(folder.id);
    }
  }

  function handleDeleteImage(imageId: string, imageName: string) {
    if (confirm(`Delete "${imageName}"?`)) {
      deleteImage(imageId);
    }
  }
</script>

<div class="catalogue-folder" style="padding-left: {depth * 12}px">
  <button class="folder-header" onclick={toggle}>
    <span class="folder-arrow" class:open>{open ? '\u25BE' : '\u25B8'}</span>
    <span class="folder-icon">{open ? '\uD83D\uDCC2' : '\uD83D\uDCC1'}</span>
    <span class="folder-name">{folder.name}</span>
    <span class="folder-count">({folder.children.length})</span>
  </button>

  {#if depth > 0}
    <button
      class="delete-btn"
      onclick={handleDeleteFolder}
      title="Delete folder"
    >&times;</button>
  {/if}
</div>

{#if open}
  <div class="folder-contents">
    {#each folder.children as child (child.id)}
      {#if isCatalogueFolder(child)}
        <svelte:self folder={child} depth={depth + 1} />
      {:else if isCatalogueImage(child)}
        <div class="image-item" style="padding-left: {(depth + 1) * 12}px">
          <ImageThumbnail image={child} size={48} />
          <button
            class="delete-img-btn"
            onclick={() => handleDeleteImage(child.id, child.name)}
            title="Delete image"
          >&times;</button>
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .catalogue-folder {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .folder-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 4px;
    flex: 1;
    text-align: left;
    border-radius: 3px;
    font-size: 12px;
  }

  .folder-header:hover {
    background: var(--surface-bg);
  }

  .folder-arrow {
    font-size: 10px;
    width: 12px;
    color: var(--text-secondary);
  }

  .folder-icon {
    font-size: 13px;
  }

  .folder-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .folder-count {
    color: var(--text-secondary);
    font-size: 10px;
  }

  .delete-btn {
    font-size: 14px;
    color: var(--text-secondary);
    padding: 2px 4px;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .catalogue-folder:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    color: var(--danger);
    background: rgba(229, 85, 85, 0.1);
  }

  .folder-contents {
    display: flex;
    flex-direction: column;
  }

  .image-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
  }

  .delete-img-btn {
    font-size: 14px;
    color: var(--text-secondary);
    padding: 2px 4px;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .image-item:hover .delete-img-btn {
    opacity: 1;
  }

  .delete-img-btn:hover {
    color: var(--danger);
  }
</style>
