/**
 * Express Ingest Router for AI Assistant Commands
 * TASK-006 Implementation
 */

import express from 'express';
import { smartPasteService } from '../../js/services/SmartPasteService.js';

const router = express.Router();

router.post('/', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const expectedSecret = process.env.API_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Jeton d\'authentification invalide.' });
  }

  const { content, title, aura, source } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Le champ content est requis.' });
  }

  try {
    const rawInput = title ? `# ${title}\n\n${content}` : content;
    const note = smartPasteService.processRawText(rawInput, source || 'AICommand');

    if (aura) {
      note.aura = aura;
    }

    res.status(201).json({
      message: 'Note reçue et préparée avec succès.',
      note: note.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: `Échec du traitement de la note : ${err.message}` });
  }
});

export default router;
