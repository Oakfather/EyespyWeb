<script lang="ts">
  let {
    foundCount = 0,
    elapsed = 0,
    onReplay,
    onEdit,
    onHome,
  }: {
    foundCount?: number;
    elapsed?: number;
    onReplay: () => void;
    onEdit: () => void;
    onHome: () => void;
  } = $props();

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
</script>

<div class="complete-backdrop">
  <div class="complete-panel">
    <h2 class="complete-title">Level Complete!</h2>

    <div class="stats">
      <div class="stat">
        <span class="stat-label">Images Found</span>
        <span class="stat-value">{foundCount}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Time</span>
        <span class="stat-value">{formatTime(elapsed)}</span>
      </div>
    </div>

    <div class="actions">
      <button class="action-btn primary" onclick={onReplay}>Replay</button>
      <button class="action-btn" onclick={onEdit}>Edit</button>
      <button class="action-btn" onclick={onHome}>Home</button>
    </div>
  </div>
</div>

<style>
  .complete-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .complete-panel {
    background: var(--surface-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    min-width: 280px;
  }

  .complete-title {
    color: var(--accent);
    font-size: 24px;
    margin-bottom: 20px;
  }

  .stats {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin-bottom: 24px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .action-btn {
    padding: 8px 20px;
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 600;
    border: 1px solid var(--border);
    background: var(--panel-bg);
  }

  .action-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .action-btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .action-btn.primary:hover {
    background: var(--accent-hover);
  }
</style>
