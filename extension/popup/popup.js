/**
 * AuraNote AI Studio Extension - Popup Script
 * TASK-004 Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('capture-btn');
  const statusMsg = document.getElementById('status-msg');

  captureBtn.addEventListener('click', async () => {
    statusMsg.textContent = 'Capture en cours...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      statusMsg.textContent = 'Aucun onglet actif trouvé.';
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'CAPTURE_SELECTION' }, (response) => {
      if (chrome.runtime.lastError) {
        statusMsg.textContent = 'Erreur: Recharchez la page IA.';
        return;
      }

      if (response && response.capturedText) {
        statusMsg.textContent = '✅ Note capturée avec succès !';
        setTimeout(() => window.close(), 1500);
      } else {
        statusMsg.textContent = '⚠️ Aucun texte sélectionné ou trouvé.';
      }
    });
  });
});
