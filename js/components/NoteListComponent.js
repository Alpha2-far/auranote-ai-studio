/**
 * Note List Sidebar Component
 * TASK-007 Implementation
 */

export function getAuraBadgeClass(aura) {
  switch (aura) {
    case 'Stratégie & Décisions': return 'aura-strategy';
    case 'Actions & Objectifs': return 'aura-actions';
    case 'Technique & Architecture': return 'aura-tech';
    case 'Workflows & Processus': return 'aura-workflows';
    default: return 'aura-inspirations';
  }
}

export function renderNoteList(containerEl, { notes, activeNoteId, onSelectNote }) {
  if (!notes || notes.length === 0) {
    containerEl.innerHTML = `
      <div style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-size: 14px;">
        Aucune réflexion enregistrée.<br>Utilisez <b>Smart Paste</b> pour capturer votre première note !
      </div>
    `;
    return;
  }

  containerEl.innerHTML = notes.map(note => {
    const isActive = note.id === activeNoteId;
    const badgeClass = getAuraBadgeClass(note.aura);
    const dateStr = new Date(note.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

    return `
      <div class="note-card ${isActive ? 'active' : ''}" data-id="${note.id}" style="
        padding: 14px 16px;
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        background: ${isActive ? 'var(--bg-card-hover)' : 'transparent'};
        transition: background 0.15s ease;
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="aura-badge ${badgeClass}">${note.aura}</span>
          <span style="font-size:11px; color:var(--text-muted);">${dateStr}</span>
        </div>
        <div style="font-size:14px; font-weight:600; color:var(--text-main); margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${note.title}
        </div>
        <div style="font-size:12px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
          ${note.content ? note.content.substring(0, 100) : 'Note vide'}
        </div>
      </div>
    `;
  }).join('');

  containerEl.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => {
      const noteId = card.getAttribute('data-id');
      onSelectNote(noteId);
    });
  });
}
