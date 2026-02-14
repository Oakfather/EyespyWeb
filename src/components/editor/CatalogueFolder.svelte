<script lang="ts">
  import type { CatalogueFolder, CatalogueImage } from '$lib/types';
  import { isCatalogueImage, isCatalogueFolder } from '$lib/types';
  import { deleteImage, deleteFolder } from '$lib/stores/projectStore.svelte';
  import { getCurrentScene, addHiddenEntry, removeHiddenEntry } from '$lib/stores/editorStore.svelte';
  import ImageThumbnail from '../shared/ImageThumbnail.svelte';

  let { folder, depth = 0, parentPath = '' }: { folder: CatalogueFolder; depth?: number; parentPath?: string } = $props();

  // depth 0 is the synthetic "Root" container — no real path
  const folderPath = $derived(depth === 0 ? '' : parentPath ? `${parentPath}/${folder.name}` : folder.name);

  const scene = $derived(getCurrentScene());

  function isImageInScene(imageId: string): boolean {
    return !!scene?.hiddenEntries.some((e) => e.catalogueImageId === imageId);
  }

  function toggleImageInScene(imageId: string): void {
    if (!scene) return;
    const existing = scene.hiddenEntries.find((e) => e.catalogueImageId === imageId);
    if (existing) {
      removeHiddenEntry(existing.id);
    } else {
      addHiddenEntry(imageId);
    }
  }

  let open = $state(true);

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

{#if depth > 0}
  <div class="catalogue-folder" style="padding-left: {depth * 12}px">
    <button class="folder-header" onclick={() => open = !open}>
      <span class="folder-arrow" class:open>{open ? '\u25BE' : '\u25B8'}</span>
      <span class="folder-icon">{open ? '\uD83D\uDCC2' : '\uD83D\uDCC1'}</span>
      <div class="folder-label">
        <span class="folder-name">{folder.name}</span>
        {#if folderPath}
          <span class="item-path" title={folderPath}>{folderPath}</span>
        {/if}
      </div>
      <span class="folder-count">({folder.children.length})</span>
    </button>
    <button class="delete-btn" onclick={handleDeleteFolder} title="Delete folder">&times;</button>
  </div>
{/if}

{#if depth === 0 || open}
  <div class="folder-contents">
    {#each folder.children as child (child.id)}
      {#if isCatalogueFolder(child)}
        <svelte:self folder={child} depth={depth + 1} parentPath={folderPath} />
      {:else if isCatalogueImage(child)}
        {@const imagePath = folderPath ? `${folderPath}/${child.name}` : child.name}
        <div class="image-item" style="padding-left: {(depth + 1) * 12}px">
          <ImageThumbnail
            image={child}
            size={48}
            isInScene={isImageInScene(child.id)}
            onclick={() => toggleImageInScene(child.id)}
          />
          <div class="image-label">
            <span class="image-name">{child.name}</span>
            <span class="item-path" title={imagePath}>{imagePath}</span>
          </div>
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
    min-width: 0;
  }

  .folder-header:hover {
    background: var(--surface-bg);
  }

  .folder-arrow {
    font-size: 10px;
    width: 12px;
    flex-shrink: 0;
    color: var(--text-secondary);
  }

  .folder-icon {
    font-size: 13px;
    flex-shrink: 0;
  }

  .folder-label {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .folder-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .folder-count {
    color: var(--text-secondary);
    font-size: 10px;
    flex-shrink: 0;
  }

  .item-path {
    font-size: 9px;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.7;
    font-family: monospace;
  }

  .delete-btn {
    font-size: 14px;
    color: var(--text-secondary);
    padding: 2px 4px;
    border-radius: 3px;
    flex-shrink: 0;
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
    gap: 6px;
    padding: 2px 4px;
    min-width: 0;
  }

  .image-label {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .image-name {
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .delete-img-btn {
    font-size: 14px;
    color: var(--text-secondary);
    padding: 2px 4px;
    border-radius: 3px;
    flex-shrink: 0;
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
