import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runArchaeologyAnalysis, DEFAULT_GEMMA_MODEL } from './server/gemma.ts';
import { SAMPLE_SNIPPETS } from './src/data/samples.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Middleware for parsing JSON requests with sensible limit
app.use(express.json({ limit: '2mb' }));

// Health and environment status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'The Last Commit Archaeology Engine',
    model: DEFAULT_GEMMA_MODEL,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Provide sample demonstration snippets
app.get('/api/samples', (req, res) => {
  res.json({
    success: true,
    samples: SAMPLE_SNIPPETS.map(s => ({
      id: s.id,
      label: s.label,
      title: s.title,
      language: s.language,
      description: s.description,
      code: s.code,
    })),
  });
});

// Specific sample retrieval with full demonstration report
app.get('/api/samples/:id', (req, res) => {
  const sample = SAMPLE_SNIPPETS.find(s => s.id === req.params.id);
  if (!sample) {
    return res.status(404).json({ success: false, error: 'Sample not found' });
  }
  res.json({ success: true, sample });
});

// Core code archaeology analysis endpoint
app.post('/api/analyze-code', async (req, res) => {
  try {
    const { code, language, mode, context, title } = req.body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please paste a valid, non-empty code snippet to analyze.',
      });
    }

    if (!['seance', 'autopsy', 'resurrection'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis mode specified. Choose Séance, Autopsy, or Resurrection.',
      });
    }

    const result = await runArchaeologyAnalysis({
      code,
      language,
      mode,
      context,
      title,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('API Error in /api/analyze-code:', error);

    const errorMessage = error?.message || 'An unexpected failure occurred during analysis.';
    
    // Check for common conditions like missing key or rate limits
    const isApiKeyMissing = errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API key not found');
    const isQuota = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED');

    let userFriendlyMessage = errorMessage;
    if (isApiKeyMissing) {
      userFriendlyMessage = 'GEMINI_API_KEY is not configured on the server. You can explore our pre-analyzed archival samples below while setting up your environment.';
    } else if (isQuota) {
      userFriendlyMessage = 'The hosted AI quota is temporarily saturated. Please pause a moment before retrying or review an archival sample.';
    }

    res.status(500).json({
      success: false,
      error: userFriendlyMessage,
      canUseSample: true,
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving for Google Cloud Run
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[The Last Commit] Server listening at http://${HOST}:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
    console.log(`[The Last Commit] Model configured: ${DEFAULT_GEMMA_MODEL}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
