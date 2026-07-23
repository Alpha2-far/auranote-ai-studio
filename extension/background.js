/**
 * AuraNote AI Studio Extension - Service Worker (Background)
 * TASK-004 Implementation
 */

// Création du menu contextuel au lancement
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'auranote-send-selection',
    title: 'Envoyer vers AuraNote (%s)',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'auranote-send-page',
    title: 'Capturer la réponse IA de cette page',
    contexts: ['page']
  });
});

// Écoute du clic sur le menu contextuel
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  const capturedText = info.selectionText || '';

  chrome.tabs.sendMessage(tab.id, {
    action: 'CAPTURE_SELECTION',
    text: capturedText
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('Content script non prêt :', chrome.runtime.lastError.message);
    }
  });
});

// Écoute des messages venant du Popup ou du Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'OPEN_AURANOTE_WITH_DATA') {
    // Transmet la note capturée vers l'instance AuraNote ouverte
    chrome.tabs.query({ url: ['http://localhost/*', 'http://127.0.0.1/*'] }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'INGEST_CAPTURED_NOTE',
          payload: message.payload
        });
        chrome.tabs.update(tabs[0].id, { active: true });
      }
    });
    sendResponse({ status: 'OK' });
  }
  return true;
});
