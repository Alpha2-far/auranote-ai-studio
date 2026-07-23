/**
 * AuraNote AI Studio - Main Application Orchestrator
 */

import storageService from './services/StorageService.js';
import smartPasteService from './services/SmartPasteService.js';
import localFileSyncService from './services/LocalFileSyncService.js';
import exportService from './services/ExportService.js';

import { renderHeader } from './components/HeaderComponent.js';
import { renderFilterBar } from './components/AuraFilterBarComponent.js';
import { renderNoteList } from './components/NoteListComponent.js';
import { renderZenEditor } from './components/ZenReaderEditorComponent.js';

class App {
  constructor() {
    this.notes = [];
    this.filteredNotes = [];
    this.activeNoteId = null;
    this.activeAura = null;
    this.searchQuery = '';
    this.isEditing = false;
    this.syncStatus = 'Non connecté';
  }

  async init() {
    console.log('⚡ Initialisation de AuraNote AI Studio...');
    try {
      await storageService.init();
      await this.loadNotes();
      this.initEventListeners();
      this.render();
      this.showToast('AuraNote AI Studio prêt.');
    } catch (err) {
      console.error('Échec initialisation :', err);
      this.showToast(`Erreur d'initialisation : ${err.message}`);
    }
  }

  async loadNotes() {
    if (this.activeAura) {
      this.notes = await storageService.getNotesByAura(this.activeAura);
    } else {
      this.notes = await storageService.getAllNotes();
    }
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.notes];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }

    this.filteredNotes = result;

    if (this.activeNoteId && !this.filteredNotes.some(n => n.id === this.activeNoteId)) {
      this.activeNoteId = this.filteredNotes.length > 0 ? this.filteredNotes[0].id : null;
    } else if (!this.activeNoteId && this.filteredNotes.length > 0) {
      this.activeNoteId = this.filteredNotes[0].id;
    }
  }

  initEventListeners() {
    // Écouteur pour les captures envoyées par l'Extension Navigateur
    window.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'AURANOTE_EXTENSION_CAPTURE') {
        const note = smartPasteService.processRawText(event.data.text, 'Extension');
        await this.addAndSyncNote(note);
      }
    });

    // Écouteur pour le Web Share Target PWA
    if (window.location.hash.includes('share-target') || window.location.search.includes('text=')) {
      const params = new URLSearchParams(window.location.search);
      const text = params.get('text') || params.get('title') || '';
      if (text) {
        const note = smartPasteService.processRawText(text, 'MobileShare');
        this.addAndSyncNote(note);
      }
    }
  }

  async handleSmartPaste() {
    try {
      const note = await smartPasteService.smartPaste();
      await this.addAndSyncNote(note);
      this.showToast(`Note capturée : "${note.title}"`);
    } catch (err) {
      this.showToast(`Échec du Smart Paste : ${err.message}`);
    }
  }

  async addAndSyncNote(note) {
    const savedNote = await storageService.addNote(note);

    if (localFileSyncService.fileHandle) {
      try {
        await localFileSyncService.syncNoteToFile(savedNote);
        this.showToast('Note synchronisée avec Monidée.md !');
      } catch (err) {
        console.warn('Sync file warning:', err);
      }
    }

    await this.loadNotes();
    this.activeNoteId = savedNote.id;
    this.render();
  }

  async handleSelectFile() {
    try {
      const handle = await localFileSyncService.selectFileHandle();
      if (handle) {
        this.syncStatus = handle.name;
        this.showToast(`Connecté au fichier local : ${handle.name}`);
        this.renderHeader();
      }
    } catch (err) {
      this.showToast(`Erreur fichier local : ${err.message}`);
    }
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  renderHeader() {
    const headerEl = document.getElementById('header-app');
    if (headerEl) {
      renderHeader(headerEl, {
        onSelectFile: () => this.handleSelectFile(),
        syncStatus: this.syncStatus
      });
      document.getElementById('smart-paste-header-btn')?.addEventListener('click', () => this.handleSmartPaste());
    }
  }

  render() {
    this.renderHeader();

    const filterEl = document.getElementById('sidebar-filters');
    if (filterEl) {
      renderFilterBar(filterEl, {
        activeAura: this.activeAura,
        onFilterChange: async (aura) => {
          this.activeAura = aura;
          await this.loadNotes();
          this.render();
        },
        onSearchInput: (query) => {
          this.searchQuery = query;
          this.applyFilters();
          this.renderNoteList();
        }
      });
    }

    this.renderNoteList();
    this.renderEditor();
  }

  renderNoteList() {
    const listEl = document.getElementById('sidebar-list');
    if (listEl) {
      renderNoteList(listEl, {
        notes: this.filteredNotes,
        activeNoteId: this.activeNoteId,
        onSelectNote: (id) => {
          this.activeNoteId = id;
          this.isEditing = false;
          this.render();
        }
      });
    }
  }

  renderEditor() {
    const editorEl = document.getElementById('main-editor');
    if (editorEl) {
      const activeNote = this.notes.find(n => n.id === this.activeNoteId);
      renderZenEditor(editorEl, {
        note: activeNote,
        isEditing: this.isEditing,
        onToggleEdit: (flag) => {
          this.isEditing = flag;
          this.renderEditor();
        },
        onSaveNote: async (updatedNote) => {
          await storageService.updateNote(updatedNote);
          this.isEditing = false;
          await this.loadNotes();
          this.showToast('Note enregistrée.');
          this.render();
        },
        onDeleteNote: async (id) => {
          await storageService.deleteNote(id);
          this.activeNoteId = null;
          await this.loadNotes();
          this.showToast('Note supprimée.');
          this.render();
        },
        onExportMD: (note) => exportService.exportAsMarkdown(note),
        onExportPDF: () => exportService.exportAsPDF()
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
