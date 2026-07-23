/**
 * AuraNote AI Studio Extension - Content Script
 * TASK-004 Implementation
 */

/**
 * Extract last AI response from current DOM based on active site
 * @returns {string}
 */
function extractLatestAiResponse() {
  const selection = window.getSelection().toString();
  if (selection && selection.trim()) {
    return selection.trim();
  }

  const hostname = window.location.hostname;
  let responseText = '';

  if (hostname.includes('gemini.google.com')) {
    const elements = document.querySelectorAll('.message-content, message-content, .model-response-text');
    if (elements.length > 0) {
      responseText = elements[elements.length - 1].innerText;
    }
  } else if (hostname.includes('claude.ai')) {
    const elements = document.querySelectorAll('.font-claude-message, [data-is-streaming="false"]');
    if (elements.length > 0) {
      responseText = elements[elements.length - 1].innerText;
    }
  } else if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
    const elements = document.querySelectorAll('[data-message-author-role="assistant"]');
    if (elements.length > 0) {
      responseText = elements[elements.length - 1].innerText;
    }
  }

  return responseText.trim() || document.body.innerText.substring(0, 500);
}

// Écoute des requêtes envoyées par l'Extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CAPTURE_SELECTION') {
    const textToCapture = request.text || extractLatestAiResponse();

    if (textToCapture) {
      // Stocke temporairement et transmet via window.postMessage si sur AuraNote
      window.postMessage({
        type: 'AURANOTE_EXTENSION_CAPTURE',
        text: textToCapture,
        source: 'Extension'
      }, '*');

      chrome.storage.local.set({ lastCapturedText: textToCapture }, () => {
        console.log('AuraNote: Texte capturé avec succès.');
      });
    }

    sendResponse({ success: true, capturedText: textToCapture });
  }
  return true;
});
