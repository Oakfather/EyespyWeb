<script lang="ts">
  import { getCurrentScene, setForegroundTint, setForegroundTintOpacity, setForegroundImage } from '$lib/stores/editorStore.svelte';
  import { findCatalogueImage, addImagesToFolder, getProject } from '$lib/stores/projectStore.svelte';
  import ColorPicker from '../shared/ColorPicker.svelte';
  import Slider from '../shared/Slider.svelte';
  import DropZone from '../shared/DropZone.svelte';

  const scene = $derived(getCurrentScene());
  const fgImage = $derived(scene?.foregroundImageId ? findCatalogueImage(scene.foregroundImageId) : null);

  let fileInput: HTMLInputElement;

  function handleDropImage(imageId: string) {
    setForegroundImage(imageId);
  }

  async function handleDropFiles(files: File[]) {
    const project = getProject();
    if (!project) return;
    const added = await addImagesToFolder(project.catalogue.id, files);
    if (added.length > 0) {
      setForegroundImage(added[0].id);
    }
  }

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    const project = getProject();
    if (!project) return;
    const added = await addImagesToFolder(project.catalogue.id, Array.from(input.files));
    if (added.length > 0) {
      setForegroundImage(added[0].id);
    }
    input.value = '';
  }
</script>

<div class="fg-settings">
  <div class="section-label">Foreground / Obscuring Layer</div>

  {#if scene}
    <ColorPicker
      value={scene.foregroundTint}
      onchange={setForegroundTint}
      label="Tint Color"
    />

    <Slider
      value={scene.foregroundTintOpacity}
      min={0}
      max={1}
      step={0.01}
      label="Tint Opacity"
      displayValue={`${Math.round(scene.foregroundTintOpacity * 100)}%`}
      onchange={setForegroundTintOpacity}
    />

    <div class="fg-image-section">
      <div class="slot-label">Foreground Image (optional)</div>
      <DropZone onDropImage={handleDropImage} onDropFiles={handleDropFiles}>
        {#snippet children()}
          {#if fgImage}
            <div class="fg-preview">
              <img src={fgImage.thumbnailDataUrl} alt={fgImage.name} />
              <button class="clear-btn" onclick={() => setForegroundImage(null)}>&times;</button>
            </div>
          {:else}
            <button class="upload-btn" onclick={() => fileInput.click()}>
              Drop or click (fog, vignette, etc.)
            </button>
          {/if}
        {/snippet}
      </DropZone>
    </div>
  {/if}
</div>

<input
  bind:this={fileInput}
  type="file"
  accept="image/png,image/jpeg,image/webp"
  onchange={handleFileSelect}
  style="display:none"
/>

<style>
  .fg-settings {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .slot-label {
    font-size: 11px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .fg-preview {
    position: relative;
    width: 100%;
  }

  .fg-preview img {
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

  .fg-preview:hover .clear-btn {
    opacity: 1;
  }

  .clear-btn:hover {
    background: var(--danger);
  }

  .upload-btn {
    font-size: 11px;
    color: var(--text-secondary);
    padding: 8px;
  }

  .upload-btn:hover {
    color: var(--accent);
  }
</style>
