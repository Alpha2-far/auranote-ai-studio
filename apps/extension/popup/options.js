import { getConfig } from '../config.js';

const apiBase = document.getElementById('apiBase');
const apiSecret = document.getElementById('apiSecret');
const saved = document.getElementById('saved');

getConfig().then((cfg) => {
  apiBase.value = cfg.apiBase;
  apiSecret.value = cfg.apiSecret;
});

document.getElementById('save').addEventListener('click', async () => {
  await chrome.storage.local.set({
    apiBase: apiBase.value.trim().replace(/\/$/, ''),
    apiSecret: apiSecret.value,
  });
  saved.textContent = '✓ Enregistré';
  setTimeout(() => (saved.textContent = ''), 2000);
});
