/**
 * AuraNote AI Studio - Storage Service (IndexedDB)
 * TASK-001 Implementation
 */

import { DB_CONFIG, DEFAULT_SETTINGS } from '../config.js';
import { Note } from '../models/Note.js';

class StorageService {
  constructor() {
    this.db = null;
    this._dbPromise = null;
  }

  /**
   * Initialize and open IndexedDB connection
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.db) return this.db;
    if (this._dbPromise) return this._dbPromise;

    this._dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB n\'est pas supporté par votre navigateur.'));
      }

      const request = window.indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store des Notes
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.NOTES)) {
          const notesStore = db.createObjectStore(DB_CONFIG.STORES.NOTES, { keyPath: 'id' });
          notesStore.createIndex('aura', 'aura', { unique: false });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
          notesStore.createIndex('isSyncedWithFile', 'isSyncedWithFile', { unique: false });
          notesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        // Store du Paramétrage Application
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.SETTINGS)) {
          db.createObjectStore(DB_CONFIG.STORES.SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(new Error(`Erreur d'ouverture d'IndexedDB : ${event.target.error}`));
      };
    });

    return this._dbPromise;
  }

  /**
   * Add a new note to IndexedDB
   * @param {Object|Note} noteData
   * @returns {Promise<Note>}
   */
  async addNote(noteData) {
    const db = await this.init();
    const note = noteData instanceof Note ? noteData : new Note(noteData);

    if (!note.isValid()) {
      throw new Error('Données de note invalides.');
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.STORES.NOTES], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.NOTES);
      const request = store.add(note.toJSON());

      request.onsuccess = () => resolve(note);
      request.onerror = (event) => reject(new Error(`Échec de l'ajout de la note : ${event.target.error}`));
    });
  }

  /**
   * Retrieve a note by ID
   * @param {string} id
   * @returns {Promise<Note|null>}
   */
  async getNoteById(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.STORES.NOTES], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.STORES.NOTES);
      const request = store.get(id);

      request.onsuccess = (event) => {
        const result = event.target.result;
        resolve(result ? new Note(result) : null);
      };

      request.onerror = (event) => reject(new Error(`Erreur lors de la récupération : ${event.target.error}`));
    });
  }

  /**
   * Get all notes ordered by creation date descending
   * @returns {Promise<Note[]>}
   */
  async getAllNotes() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.STORES.NOTES], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.STORES.NOTES);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev');
      const notes = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          notes.push(new Note(cursor.value));
          cursor.continue();
        } else {
          resolve(notes);
        }
      };

      request.onerror = (event) => reject(new Error(`Erreur lors de la lecture des notes : ${event.target.error}`));
    });
  }

  /**
   * Get notes filtered by Aura category
   * @param {string} aura
   * @returns {Promise<Note[]>}
   */
  async getNotesByAura(aura) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.STORES.NOTES], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.STORES.NOTES);
      const index = store.index('aura');
      const request = index.getAll(aura);

      request.onsuccess = (event) => {
        const results = event.target.result || [];
        const notes = results
          .map((item) => new Note(item))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(notes);
      };

      request.onerror = (event) => reject(new Error(`Erreur lors du filtrage par Aura : ${event.target.error}`));
    });
  }

  /**
   * Update an existing note
   * @param {Note} note
   * @returns {Promise<Note>}
   */
  async updateNote(note) {
    const db = await this.init();
    note.updatedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.STORES.NOTES], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.NOTES);
      const request = store.put(note.toJSON());

      request.onsuccess = () => resolve(note);
      request.onerror = (event) => reject(new Error(`Échec de la mise à jour de la note : ${event.target.error}`));
    });
  }

  /**
   * Delete a note by ID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteNote(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.STORES.NOTES], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.NOTES);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(new Error(`Échec de la suppression : ${event.target.error}`));
    });
  }

  /**
   * Save setting key-value pair
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async setSetting(key, value) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.SETTINGS);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(new Error(`Erreur de sauvegarde du paramètre : ${event.target.error}`));
    });
  }

  /**
   * Get setting value by key
   * @param {string} key
   * @param {any} [defaultValue=null]
   * @returns {Promise<any>}
   */
  async getSetting(key, defaultValue = null) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.STORES.SETTINGS);
      const request = store.get(key);

      request.onsuccess = (event) => {
        const res = event.target.result;
        resolve(res ? res.value : defaultValue);
      };

      request.onerror = (event) => reject(new Error(`Erreur de lecture du paramètre : ${event.target.error}`));
    });
  }
}

export const storageService = new StorageService();
export default storageService;
