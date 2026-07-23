// Content script (standalone, sans import) — extrait la dernière réponse de l'IA.
(() => {
  const SELECTORS = {
    'gemini.google.com': ['.model-response-text', 'message-content', '.message-content'],
    'claude.ai': ['[data-is-streaming="false"]', '.font-claude-message'],
    'chatgpt.com': ['[data-message-author-role="assistant"]'],
  };

  function extractLatestAiResponse() {
    const selection = window.getSelection?.()?.toString().trim();
    if (selection) return selection;

    const host = location.hostname;
    const key = Object.keys(SELECTORS).find((k) => host.includes(k));
    if (key) {
      for (const sel of SELECTORS[key]) {
        const nodes = document.querySelectorAll(sel);
        if (nodes.length) {
          const text = nodes[nodes.length - 1].innerText?.trim();
          if (text) return text;
        }
      }
    }
    return (document.body.innerText || '').slice(0, 4000).trim();
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.action === 'EXTRACT') {
      sendResponse({ text: extractLatestAiResponse(), source: 'Extension' });
    }
    return true;
  });
})();
