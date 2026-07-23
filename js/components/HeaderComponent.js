/**
 * Header Component with Brand Logo SVG and Monidée.md Sync Trigger
 * TASK-007 Implementation
 */

export function renderHeader(containerEl, { onSelectFile, syncStatus }) {
  containerEl.innerHTML = `
    <header class="header-container">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 512 512" fill="none">
          <rect width="512" height="512" rx="115" fill="#0D0F12"/>
          <circle cx="256" cy="256" r="165" fill="none" stroke="#E2B872" stroke-width="20" stroke-dasharray="10 14" opacity="0.4"/>
          <path d="M 160 360 L 256 140 L 352 360 M 195 280 H 317 C 385 280 420 210 370 148 C 318 82 194 82 142 148 C 92 210 127 280 195 280" fill="none" stroke="#F4EFE6" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="362" cy="152" r="18" fill="#E2B872"/>
        </svg>
        <span class="brand-title">AuraNote AI Studio</span>
      </div>
      <div class="header-actions">
        <button id="sync-file-btn" class="btn btn-secondary">
          📂 Sync Monidée.md <span style="font-size:11px; opacity:0.7;">(${syncStatus || 'Non connecté'})</span>
        </button>
        <button id="smart-paste-header-btn" class="btn btn-primary">
          ⚡ Smart Paste
        </button>
      </div>
    </header>
  `;

  document.getElementById('sync-file-btn')?.addEventListener('click', onSelectFile);
}
