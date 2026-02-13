<script lang="ts">
  let { value, onchange, label = '' }: { value: string; onchange: (color: string) => void; label?: string } = $props();

  function handleInput(e: Event) {
    onchange((e.target as HTMLInputElement).value);
  }
</script>

<div class="color-picker">
  {#if label}
    <span class="label">{label}</span>
  {/if}
  <div class="picker-row">
    <input type="color" {value} oninput={handleInput} class="color-input" />
    <span class="hex-value">{value}</span>
  </div>
</div>

<style>
  .color-picker {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .picker-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-input {
    width: 32px;
    height: 24px;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1px;
    cursor: pointer;
    background: none;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }

  .hex-value {
    font-size: 11px;
    color: var(--text-secondary);
    font-family: monospace;
  }
</style>
