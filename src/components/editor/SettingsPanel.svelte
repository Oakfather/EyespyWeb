<script lang="ts">
  import BackgroundSlot from './BackgroundSlot.svelte';
  import ForegroundSettings from './ForegroundSettings.svelte';
  import HiddenImageList from './HiddenImageList.svelte';
</script>

<div class="settings-panel">
  <div class="panel-header">
    <span class="panel-title">Scene Settings</span>
  </div>

  <div class="settings-content">
    <BackgroundSlot />

    <div class="divider"></div>

    <ForegroundSettings />

    <div class="divider"></div>

    <HiddenImageList />
  </div>
</div>

<style>
  .settings-panel {
    width: var(--panel-width-right);
    min-width: var(--panel-width-right);
    background: var(--surface-bg);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
  }

  .panel-title {
    font-weight: 600;
    font-size: 13px;
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .divider {
    height: 1px;
    background: var(--border);
  }
</style>
