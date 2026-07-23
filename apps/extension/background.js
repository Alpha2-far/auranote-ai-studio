import { sendToAuraNote } from './config.js';

const MENU_SELECTION = 'auranote-send-selection';
const MENU_PAGE = 'auranote-send-page';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_SELECTION,
    title: 'Envoyer la sélection vers AuraNote',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: MENU_PAGE,
    title: "Envoyer la réponse d'IA vers AuraNote",
    contexts: ['page'],
  });
});

async function capture(tabId, preferSelectionText) {
  const text = preferSelectionText || (await askContent(tabId));
  if (!text || !text.trim()) {
    notify('Rien à capturer sur cette page.');
    return;
  }
  try {
    const { title } = await sendToAuraNote({ content: text, source: 'Extension' });
    notify(`✓ Capturé : ${title ?? 'note'}`);
  } catch (err) {
    notify(`Échec : ${err.message}`);
  }
}

function askContent(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'EXTRACT' }, (resp) => {
      if (chrome.runtime.lastError) return resolve('');
      resolve(resp?.text ?? '');
    });
  });
}

function notify(message) {
  // Badge éphémère (pas de permission notifications requise)
  chrome.action.setBadgeText({ text: '•' });
  chrome.action.setTitle({ title: `AuraNote — ${message}` });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2500);
  console.log('[AuraNote]', message);
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === MENU_SELECTION) capture(tab.id, info.selectionText);
  else if (info.menuItemId === MENU_PAGE) capture(tab.id, null);
});

// Déclenché par le popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.action === 'CAPTURE_ACTIVE_TAB') {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) await capture(tab.id, null);
      sendResponse({ ok: true });
    })();
    return true;
  }
});
