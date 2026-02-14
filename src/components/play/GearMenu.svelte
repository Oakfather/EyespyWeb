<script lang="ts">
  import Slider from '../shared/Slider.svelte';

  let {
    revealSize = 80,
    onClose,
    onEdit,
    onRestart,
    onRevealSizeChange,
  }: {
    revealSize?: number;
    onClose: () => void;
    onEdit: () => void;
    onRestart: () => void;
    onRevealSizeChange: (size: number) => void;
  } = $props();
</script>

<div class="menu-backdrop" onclick={onClose}>
  <div class="menu-panel" onclick={(e) => e.stopPropagation()}>
    <div class="menu-header">
      <span>Settings</span>
      <button class="close-btn" onclick={onClose}>&times;</button>
    </div>

    <div class="menu-items">
      <button class="menu-item" onclick={onEdit}>
        &#9998; Edit Mode
      </button>

      <button class="menu-item" onclick={onRestart}>
        &#8635; Restart
      </button>

      <div class="menu-slider">
        <Slider
          value={revealSize}
          min={30}
          max={200}
          step={5}
          label="Spotlight Size"
          displayValue={`${revealSize}px`}
          onchange={onRevealSizeChange}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .menu-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 56px 16px 16px;
    z-index: 50;
  }

  .menu-panel {
    background: var(--surface-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    width: 220px;
    overflow: hidden;
  }

  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    font-size: 13px;
  }

  .close-btn {
    font-size: 18px;
    color: var(--text-secondary);
    padding: 0 4px;
  }

  .close-btn:hover {
    color: var(--text-primary);
  }

  .menu-items {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .menu-item {
    padding: 8px 12px;
    text-align: left;
    border-radius: 4px;
    font-size: 13px;
  }

  .menu-item:hover {
    background: var(--panel-bg);
    color: var(--accent);
  }

  .menu-slider {
    padding: 8px 12px;
  }
</style>
