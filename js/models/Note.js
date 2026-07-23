/**
 * AuraNote AI Studio - Note Data Model
 * TASK-001 Implementation
 */

import { AURA_TYPES, DEFAULT_AURA } from '../config.js';

/**
 * Generate a random UUID v4 string
 * @returns {string}
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class Note {
  /**
   * @param {Object} data
   * @param {string} [data.id]
   * @param {string} data.title
   * @param {string} data.content
   * @param {string} [data.aura]
   * @param {string} [data.source]
   * @param {string[]} [data.tags]
   * @param {string} [data.createdAt]
   * @param {string} [data.updatedAt]
   * @param {boolean} [data.isSyncedWithFile]
   */
  constructor(data = {}) {
    const now = new Date().toISOString();

    this.id = data.id || generateUUID();
    this.title = (data.title || 'Sans titre').trim();
    this.content = data.content || '';
    this.aura = AURA_TYPES.includes(data.aura) ? data.aura : DEFAULT_AURA;
    this.source = data.source || 'SmartPaste';
    this.tags = Array.isArray(data.tags) ? [...data.tags] : [];
    this.createdAt = data.createdAt || now;
    this.updatedAt = data.updatedAt || now;
    this.isSyncedWithFile = Boolean(data.isSyncedWithFile);
  }

  /**
   * Validate note instance integrity
   * @returns {boolean}
   */
  isValid() {
    return (
      typeof this.id === 'string' &&
      this.id.length > 0 &&
      typeof this.title === 'string' &&
      typeof this.content === 'string' &&
      AURA_TYPES.includes(this.aura) &&
      typeof this.createdAt === 'string'
    );
  }

  /**
   * Plain object representation for IndexedDB
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      aura: this.aura,
      source: this.source,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isSyncedWithFile: this.isSyncedWithFile
    };
  }
}
