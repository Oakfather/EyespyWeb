<script lang="ts">
  let {
    foundCount = 0,
    totalCount = 0,
    elapsed = 0,
    onMenuOpen,
  }: {
    foundCount?: number;
    totalCount?: number;
    elapsed?: number;
    onMenuOpen: () => void;
  } = $props();

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
</script>

<div class="hud">
  <div class="hud-left">
    <span class="found-counter">Found: {foundCount}/{totalCount}</span>
    <span class="timer">{formatTime(elapsed)}</span>
  </div>
  <div class="hud-right">
    <button class="gear-btn" onclick={onMenuOpen} title="Settings">&#9881;</button>
  </div>
</div>

<style>
  .hud {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 16px;
  }

  .hud-left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .found-counter,
  .timer {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .hud-right {
    pointer-events: auto;
  }

  .gear-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    transition: background 0.15s;
  }

  .gear-btn:hover {
    background: rgba(0, 0, 0, 0.8);
  }
</style>
