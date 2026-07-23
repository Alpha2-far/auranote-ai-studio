/**
 * Zen Reader & Editor Component (Mobile Ready with Back Button)
 * TASK-007 Implementation
 */

import { getAuraBadgeClass } from './NoteListComponent.js';

export function renderZenEditor(containerEl, { note, isEditing, onToggleEdit, onSaveNote, onDeleteNote, onExportMD, onExportPDF, onMobileBack }) {
  if (!note) {
    containerEl.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-muted); padding:30px 20px; text-align:center;">
        <svg width="56" height="56" viewBox="0 0 512 512" fill="none" style="opacity:0.4; margin-bottom:16px;">
          <rect width="512" height="512" rx="115" fill="#0D0F12"/>
          <circle cx="256" cy="256" r="165" fill="none" stroke="#E2B872" stroke-width="20"/>
          <path d="M 160 360 L 256 140 L 352 360 M 195 280 H 317" stroke="#F4EFE6" stroke-width="24"/>
        </svg>
        <h3 style="color:var(--text-main); font-size:17px; margin-bottom:8px;">Sélectionnez une réflexion</h3>
        <p style="font-size:13px; max-width:320px;">Cliquez sur <b>Smart Paste</b> pour capturer instantanément une idée depuis Gemini, Claude ou ChatGPT.</p>
      </div>
    `;
    return;
  }

  const badgeClass = getAuraBadgeClass(note.aura);
  const dateFormatted = new Date(note.createdAt).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  if (isEditing) {
    containerEl.innerHTML = `
      <div class="zen-container">
        <button id="mobile-back-btn" class="mobile-back-btn">← Retour aux notes</button>
        <div class="zen-header">
          <div class="zen-meta">
            <span class="aura-badge ${badgeClass}">${note.aura}</span>
            <span class="zen-date">${dateFormatted}</span>
          </div>
          <input type="text" id="edit-title-input" class="zen-title" value="${note.title}" style="background:transparent; border:none; border-bottom:1px solid var(--accent-gold); width:100%;" />
        </div>
        <textarea id="edit-content-input" class="zen-editor-textarea">${note.content}</textarea>
        <div class="zen-toolbar">
          <button id="save-edit-btn" class="btn btn-primary">💾 Enregistrer</button>
          <button id="cancel-edit-btn" class="btn btn-secondary">Annuler</button>
        </div>
      </div>
    `;

    document.getElementById('mobile-back-btn')?.addEventListener('click', onMobileBack);
    document.getElementById('save-edit-btn')?.addEventListener('click', () => {
      const newTitle = document.getElementById('edit-title-input').value;
      const newContent = document.getElementById('edit-content-input').value;
      onSaveNote({ ...note, title: newTitle, content: newContent });
    });

    document.getElementById('cancel-edit-btn')?.addEventListener('click', () => onToggleEdit(false));
  } else {
    // Basic Markdown HTML parser helper
    const parsedHtml = (note.content || '')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>');

    containerEl.innerHTML = `
      <div class="zen-container">
        <button id="mobile-back-btn" class="mobile-back-btn">← Retour aux notes</button>
        <div class="zen-header">
          <div class="zen-meta">
            <span class="aura-badge ${badgeClass}">${note.aura}</span>
            <span class="zen-date">${dateFormatted}</span>
            <span style="font-size:11px; color:${note.isSyncedWithFile ? '#4ADE80' : 'var(--text-muted)'}; margin-left:auto;">
              ${note.isSyncedWithFile ? '✓ Synchro' : '• Local'}
            </span>
          </div>
          <h1 class="zen-title">${note.title}</h1>
          <div class="zen-toolbar">
            <button id="edit-btn" class="btn btn-secondary">✏️ Éditer</button>
            <button id="export-md-btn" class="btn btn-secondary">📥 MD</button>
            <button id="export-pdf-btn" class="btn btn-secondary">📄 PDF</button>
            <button id="delete-btn" class="btn btn-secondary" style="color:#EF4444; border-color:rgba(239,68,68,0.3);">🗑️ Supprimer</button>
          </div>
        </div>
        <div class="zen-content">
          ${parsedHtml}
        </div>
      </div>
    `;

    document.getElementById('mobile-back-btn')?.addEventListener('click', onMobileBack);
    document.getElementById('edit-btn')?.addEventListener('click', () => onToggleEdit(true));
    document.getElementById('export-md-btn')?.addEventListener('click', () => onExportMD(note));
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => onExportPDF(note));
    document.getElementById('delete-btn')?.addEventListener('click', () => {
      if (confirm('Voulez-vous supprimer cette réflexion ?')) {
        onDeleteNote(note.id);
      }
    });
  }
}
