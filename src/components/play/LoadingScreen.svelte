<script lang="ts">
  let { progress = 0 }: { progress?: number } = $props();
</script>

<div class="loading-screen">
  <div class="loading-content">
    <h2 class="loading-title">EyeSpy</h2>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress * 100}%"></div>
    </div>
    <p class="loading-text">Loading assets...</p>
  </div>
</div>

<style>
  .loading-screen {
    position: absolute;
    inset: 0;
    background: var(--panel-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .loading-content {
    text-align: center;
    width: 240px;
  }

  .loading-title {
    color: var(--accent);
    font-size: 28px;
    margin-bottom: 24px;
  }

  .progress-bar {
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 0.2s ease;
  }

  .loading-text {
    color: var(--text-secondary);
    font-size: 12px;
    margin-top: 12px;
  }
</style>
