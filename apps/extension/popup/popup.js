const status = document.getElementById('status');

document.getElementById('capture').addEventListener('click', () => {
  status.textContent = 'Capture en cours…';
  chrome.runtime.sendMessage({ action: 'CAPTURE_ACTIVE_TAB' }, () => {
    status.textContent = 'Envoyé. Vérifie ton carnet AuraNote.';
    setTimeout(() => window.close(), 900);
  });
});
