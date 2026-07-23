/**
 * AuraNote AI Studio - Express Main Server (Railway Production Ready)
 * TASK-006 Implementation
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import ingestRouter from './routes/ingest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Endpoint de santé pour Railway (Healthcheck)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', app: 'AuraNote AI Studio', port: PORT });
});

// Endpoint API d'ingestion des Ordres IA
app.use('/api/v1/notes/ingest', ingestRouter);

// Servir les fichiers statiques de l'application SPA
app.use(express.static(rootDir));

// Redirection SPA pour toutes les autres routes client
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur AuraNote AI Studio en ligne sur http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  console.error('Erreur Serveur :', err);
});
