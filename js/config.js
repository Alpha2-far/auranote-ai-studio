/**
 * AuraNote AI Studio - Global Configuration & Constants
 * TASK-001 Implementation
 */

export const DB_CONFIG = {
  NAME: 'AuraNoteDB',
  VERSION: 1,
  STORES: {
    NOTES: 'notes',
    SETTINGS: 'settings'
  }
};

export const AURA_TYPES = Object.freeze([
  'Stratégie & Décisions',
  'Actions & Objectifs',
  'Technique & Architecture',
  'Workflows & Processus',
  'Inspirations & Idées brutes'
]);

export const DEFAULT_AURA = 'Inspirations & Idées brutes';

export const DEFAULT_SETTINGS = Object.freeze({
  defaultAura: DEFAULT_AURA,
  autoCleanFormatting: true,
  themeMode: 'dark',
  monIdeeFilePath: null
});
