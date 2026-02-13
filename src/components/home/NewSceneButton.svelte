<script lang="ts">
  let { onclick }: { onclick: () => void } = $props();
</script>

<button class="new-scene" onclick={onclick}>
  <div class="reticle">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
      <line x1="24" y1="16" x2="24" y2="32" stroke="currentColor" stroke-width="1.5" />
      <line x1="16" y1="24" x2="32" y2="24" stroke="currentColor" stroke-width="1.5" />
    </svg>
  </div>
  <div class="label">New Scene</div>
</button>

<style>
  .new-scene {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    min-height: 140px;
    color: var(--text-secondary);
    transition: border-color 0.15s, color 0.15s;
  }

  .new-scene:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .reticle {
    margin-bottom: 8px;
  }

  .label {
    font-size: 13px;
    font-weight: 500;
  }
</style>
