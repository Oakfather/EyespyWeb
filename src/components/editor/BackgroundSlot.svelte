<script lang="ts">
  import { getCurrentScene } from '$lib/stores/editorStore.svelte';
  import { setBackground, clearBackground } from '$lib/stores/editorStore.svelte';
  import { findCatalogueImage, addImagesToFolder, getProject } from '$lib/stores/projectStore.svelte';
  import DropZone from '../shared/DropZone.svelte';

  const scene = $derived(getCurrentScene());
  const bgImage = $derived(scene?.backgroundImageId ? findCatalogueImage(scene.backgroundImageId) : null);

  let fileInput: HTMLInputElement;

  function handleDropImage(imageId: string) {
    setBackground(imageId);
  }

  async function handleDropFiles(files: File[]) {
    const project = getProject();
    if (!project) return;
    const added = await addImagesToFolder(project.catalogue.id, files);
    if (added.length > 0) {
      setBackground(added[0].id);
    }
  }

  function handleClick() {
    fileInput.click();
  }

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    const project = getProject();
    if (!project) return;
    const added = await addImagesToFolder(project.catalogue.id, Array.from(input.files));
    if (added.length > 0) {
      setBackground(added[0].id);
    }
    input.value = '';
  }
</script>

<div class="bg-slot">
  <div class="slot-label">Background</div>
  <DropZone onDropImage={handleDropImage} onDropFiles={handleDropFiles}>
    {#snippet children()}
      {#if bgImage}
        <div class="bg-preview">
          <img src={bgImage.thumbnailDataUrl} alt={bgImage.name} />
          <button class="clear-btn" onclick={() => clearBackground()}>&times;</button>
        </div>
      {:else}
        <button class="upload-btn" onclick={handleClick}>
          Drop image or click to upload
        </button>
      {/if}
    {/snippet}
  </DropZone>
</div>

<input
  bind:this={fileInput}
  type="file"
  accept="image/png,image/jpeg,image/webp"
  onchange={handleFileSelect}
  style="display:none"
/>

<style>
  .bg-slot {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .slot-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .bg-preview {
    position: relative;
    width: 100%;
  }

  .bg-preview img {
    width: 100%;
    border-radius: 4px;
    display: block;
  }

  .clear-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .bg-preview:hover .clear-btn {
    opacity: 1;
  }

  .clear-btn:hover {
    background: var(--danger);
  }

  .upload-btn {
    font-size: 11px;
    color: var(--text-secondary);
    padding: 12px;
  }

  .upload-btn:hover {
    color: var(--accent);
  }
</style>
