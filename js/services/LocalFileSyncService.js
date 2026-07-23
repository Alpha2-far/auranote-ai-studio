/**
 * AuraNote AI Studio - Local File Sync Service (Monidée.md)
 * TASK-002 Implementation
 */

import storageService from './StorageService.js';

class LocalFileSyncService {
  constructor() {
    this.fileHandle = null;
  }

  /**
   * Check if File System Access API is supported
   * @returns {boolean}
   */
  isFileSystemAccessSupported() {
    return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
  }

  /**
   * Format Note object to standardized Markdown with YAML Frontmatter
   * @param {Object} note
   * @returns {string}
   */
  formatNoteToMarkdown(note) {
    const titleEscaped = (note.title || 'Sans titre').replace(/"/g, '\\"');
    const aura = note.aura || 'Inspirations & Idées brutes';
    const date = note.createdAt || new Date().toISOString();
    const source = note.source || 'SmartPaste';

    return `
---
id: ${note.id}
title: "${titleEscaped}"
aura: "${aura}"
source: "${source}"
date: "${date}"
---

# ${note.title}

${note.content}

---
`.trim() + '\n\n';
  }

  /**
   * Request user to pick or create Monidée.md file
   * @returns {Promise<FileSystemFileHandle|null>}
   */
  async selectFileHandle() {
    if (!this.isFileSystemAccessSupported()) {
      throw new Error('La File System Access API n\'est pas supportée par ce navigateur.');
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Fichier Markdown Monidée.md',
            accept: {
              'text/markdown': ['.md', '.txt']
            }
          }
        ],
        multiple: false
      });

      this.fileHandle = handle;
      await storageService.setSetting('monIdeeFileName', handle.name);
      return handle;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      throw new Error(`Erreur de sélection du fichier : ${err.message}`);
    }
  }

  /**
   * Verify or request readwrite permission for a FileHandle
   * @param {FileSystemFileHandle} handle
   * @returns {Promise<boolean>}
   */
  async verifyPermission(handle) {
    if (!handle) return false;

    const options = { mode: 'readwrite' };
    if ((await handle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(options)) === 'granted') {
      return true;
    }
    return false;
  }

  /**
   * Append a note to the physical file Monidée.md
   * @param {Object} note
   * @param {FileSystemFileHandle} [customHandle]
   * @returns {Promise<boolean>}
   */
  async syncNoteToFile(note, customHandle = null) {
    const handle = customHandle || this.fileHandle;

    if (!handle) {
      return false;
    }

    const hasPermission = await this.verifyPermission(handle);
    if (!hasPermission) {
      throw new Error('Permission d\'écriture refusée pour le fichier local.');
    }

    try {
      const file = await handle.getFile();
      const existingText = await file.text();
      const newContent = this.formatNoteToMarkdown(note);
      const updatedText = existingText.trim() ? `${existingText.trim()}\n\n${newContent}` : newContent;

      const writable = await handle.createWritable();
      await writable.write(updatedText);
      await writable.close();

      note.isSyncedWithFile = true;
      await storageService.updateNote(note);
      return true;
    } catch (err) {
      throw new Error(`Échec de l'écriture dans Monidée.md : ${err.message}`);
    }
  }

  /**
   * Fallback download method for browsers without File System Access API
   * @param {Object} note
   */
  downloadNoteMarkdown(note) {
    const markdownContent = this.formatNoteToMarkdown(note);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const fileName = `${(note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const localFileSyncService = new LocalFileSyncService();
export default localFileSyncService;
