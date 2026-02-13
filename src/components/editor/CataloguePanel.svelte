<script lang="ts">
  import { getProject, addImagesToFolder, addImagesWithFolderStructure } from '$lib/stores/projectStore.svelte';
  import CatalogueFolder from './CatalogueFolder.svelte';

  const project = getProject();

  let fileInput: HTMLInputElement;
  let folderInput: HTMLInputElement;

  function handleAddFiles() {
    fileInput.click();
  }

  function handleAddFolder() {
    folderInput.click();
  }

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length || !project) return;
    await addImagesToFolder(project.catalogue.id, Array.from(input.files));
    input.value = '';
  }

  async function handleFolderSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    await addImagesWithFolderStructure(Array.from(input.files));
    input.value = '';
  }
</script>

<div class="catalogue-panel">
  <div class="panel-header">
    <span class="panel-title">Catalogue</span>
  </div>

  <div class="add-buttons">
    <button class="add-btn" onclick={handleAddFiles} title="Add image files">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" stroke-width="1.5"/>
        <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      Images
    </button>
    <button class="add-btn" onclick={handleAddFolder} title="Add a folder of images">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" stroke-width="1.5"/>
        <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      Folder
    </button>
  </div>

  <div class="catalogue-tree">
    {#if project}
      <CatalogueFolder folder={project.catalogue} depth={0} />
    {/if}
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept="image/png,image/jpeg,image/webp"
    multiple
    onchange={handleFileSelect}
    class="hidden-input"
  />
  <input
    bind:this={folderInput}
    type="file"
    accept="image/png,image/jpeg,image/webp"
    multiple
    onchange={handleFolderSelect}
    class="hidden-input"
    webkitdirectory
  />
</div>

<style>
  .catalogue-panel {
    width: var(--panel-width-left);
    min-width: var(--panel-width-left);
    background: var(--surface-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
  }

  .panel-title {
    font-weight: 600;
    font-size: 13px;
  }

  .add-buttons {
    display: flex;
    gap: 4px;
    padding: 8px;
  }

  .add-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 6px 8px;
    font-size: 11px;
    border: 1px dashed var(--border);
    border-radius: 4px;
    color: var(--text-secondary);
    transition: border-color 0.1s, color 0.1s;
  }

  .add-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .catalogue-tree {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .hidden-input {
    display: none;
  }
</style>
