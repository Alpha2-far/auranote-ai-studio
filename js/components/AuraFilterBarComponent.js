/**
 * Aura Filter Bar & Search Input Component
 * TASK-008 Implementation
 */

import { AURA_TYPES } from '../config.js';

export function renderFilterBar(containerEl, { activeAura, onFilterChange, onSearchInput }) {
  const auraPillsHtml = ['Tous', ...AURA_TYPES].map(aura => {
    const isActive = activeAura === aura || (aura === 'Tous' && !activeAura);
    return `<div class="aura-pill ${isActive ? 'active' : ''}" data-aura="${aura}">${aura}</div>`;
  }).join('');

  containerEl.innerHTML = `
    <input type="text" id="search-input" class="search-input" placeholder="🔍 Rechercher dans vos réflexions..." />
    <div class="aura-filter-pills">
      ${auraPillsHtml}
    </div>
  `;

  // Événement Recherche avec Débouclage
  let timeout = null;
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      onSearchInput(e.target.value);
    }, 150);
  });

  // Événements Clic sur Pilules
  containerEl.querySelectorAll('.aura-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const selected = pill.getAttribute('data-aura');
      onFilterChange(selected === 'Tous' ? null : selected);
    });
  });
}
