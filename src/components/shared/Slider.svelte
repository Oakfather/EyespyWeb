<script lang="ts">
  let {
    value,
    min = 0,
    max = 1,
    step = 0.01,
    label = '',
    displayValue = '',
    onchange,
  }: {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    displayValue?: string;
    onchange: (value: number) => void;
  } = $props();

  function handleInput(e: Event) {
    onchange(parseFloat((e.target as HTMLInputElement).value));
  }
</script>

<div class="slider">
  {#if label}
    <div class="slider-header">
      <span class="label">{label}</span>
      <span class="value">{displayValue || value.toFixed(2)}</span>
    </div>
  {/if}
  <input
    type="range"
    {value}
    {min}
    {max}
    {step}
    oninput={handleInput}
    class="range-input"
  />
</div>

<style>
  .slider {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .value {
    font-size: 11px;
    color: var(--text-secondary);
    font-family: monospace;
  }

  .range-input {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--border);
    border-radius: 2px;
    outline: none;
  }

  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
  }
</style>
