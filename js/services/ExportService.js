/**
 * AuraNote AI Studio - Export Service (Markdown & PDF)
 * TASK-008 Implementation
 */

import localFileSyncService from './LocalFileSyncService.js';

class ExportService {
  /**
   * Export single note as downloadable Markdown file
   * @param {Object} note
   */
  exportAsMarkdown(note) {
    if (!note) return;
    localFileSyncService.downloadNoteMarkdown(note);
  }

  /**
   * Export single note or workspace as PDF via browser print dialog
   */
  exportAsPDF() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}

export const exportService = new ExportService();
export default exportService;
