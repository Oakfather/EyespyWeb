<script lang="ts">
  import { getCurrentScene, setDetectionMode, setRevealWindow } from '$lib/stores/editorStore.svelte';

  const scene = $derived(getCurrentScene());

  function handleModeChange(e: Event) {
    const val = (e.target as HTMLInputElement).value as 'center' | 'revealFull';
    setDetectionMode(val);
  }

  function handleThresholdChange(e: Event) {
    // revealFull threshold is stored on scene.revealThreshold (shared)
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (scene) { scene.revealThreshold = val; }
  }

  function handleWindowChange(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    setRevealWindow(val);
  }
</script>

{#if scene}
  <div class="detection-settings">
    <div class="section-label">Detection Mode</div>

    <label class="mode-option">
      <input
        type="radio"
        name="detectionMode"
        value="center"
        checked={scene.detectionMode === 'center'}
        onchange={handleModeChange}
      />
      <div class="mode-info">
        <span class="mode-name">Center</span>
        <span class="mode-desc">Found when the reticle passes over the image's center point</span>
      </div>
    </label>

    <label class="mode-option">
      <input
        type="radio"
        name="detectionMode"
        value="revealFull"
        checked={scene.detectionMode === 'revealFull'}
        onchange={handleModeChange}
      />
      <div class="mode-info">
        <span class="mode-name">Reveal Full</span>
        <span class="mode-desc">Found when enough of the image has been swept over within the time window</span>
      </div>
    </label>

    {#if scene.detectionMode === 'revealFull'}
      <div class="sub-settings">
        <div class="field-row">
          <label class="field-label">Coverage %</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={scene.revealThreshold}
            oninput={handleThresholdChange}
            class="slider"
          />
          <span class="field-value">{Math.round((scene.revealThreshold ?? 0.5) * 100)}%</span>
        </div>
        <div class="field-row">
          <label class="field-label">Time window</label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={scene.revealWindow ?? 3}
            oninput={handleWindowChange}
            class="slider"
          />
          <span class="field-value">{scene.revealWindow ?? 3}s</span>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .detection-settings {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .mode-option {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: 5px;
    cursor: pointer;
    transition: border-color 0.1s, background 0.1s;
  }

  .mode-option:has(input:checked) {
    border-color: var(--accent);
    background: rgba(123, 97, 255, 0.07);
  }

  .mode-option input[type="radio"] {
    margin-top: 2px;
    accent-color: var(--accent);
    flex-shrink: 0;
  }

  .mode-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mode-name {
    font-size: 12px;
    font-weight: 500;
  }

  .mode-desc {
    font-size: 10px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .sub-settings {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 8px;
    background: var(--panel-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    margin-top: 2px;
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .field-label {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 80px;
  }

  .slider {
    flex: 1;
    accent-color: var(--accent);
  }

  .field-value {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 30px;
    text-align: right;
  }
</style>
