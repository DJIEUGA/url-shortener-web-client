import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Airtable Setup
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Urls';

  let airtableBase: any = null;
  if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
    airtableBase = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
  }

  // Mock Data for URLs
  let MOCK_URLS = [
    {
      id: '1',
      originalUrl: 'https://noon.com/uae-en/electronics/laptops',
      transformedUrl: 'https://n.short/laptops-sale',
      alias: 'laptops-sale',
      transformationType: 'Shorten',
      clicks: 1240,
      createdAt: new Date().toISOString(),
      status: 'Active',
    },
    {
      id: '2',
      originalUrl: 'https://google.com/search?q=url+transformer',
      transformedUrl: 'https://n.short/ut-search',
      alias: 'ut-search',
      transformationType: 'Clean',
      clicks: 45,
      createdAt: new Date().toISOString(),
      status: 'Active',
    }
  ];

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/urls', async (req, res) => {
    try {
      if (airtableBase) {
        const records = await airtableBase(AIRTABLE_TABLE_NAME).select().firstPage();
        const urls = records.map((record: any) => ({
          id: record.id,
          ...record.fields,
        }));
        res.json(urls.length > 0 ? urls : MOCK_URLS);
      } else {
        res.json(MOCK_URLS);
      }
    } catch (error) {
      console.error('Airtable Fetch Error:', error);
      res.json(MOCK_URLS);
    }
  });

  app.post('/api/urls', async (req, res) => {
    try {
      const newUrlData = req.body;
      // Simple transform logic: shorten if requested
      const alias = newUrlData.alias || Math.random().toString(36).substring(2, 8);
      const transformedUrl = newUrlData.transformedUrl || `https://n.short/${alias}`;
      
      const recordToCreate = {
        ...newUrlData,
        transformedUrl,
        alias,
        clicks: 0,
        createdAt: new Date().toISOString(),
        status: 'Active'
      };

      if (airtableBase) {
        const record = await airtableBase(AIRTABLE_TABLE_NAME).create([
          { fields: recordToCreate }
        ]);
        res.status(201).json({ id: record[0].id, ...record[0].fields });
      } else {
        const urlObj = { ...recordToCreate, id: Math.random().toString(36).substr(2, 9) };
        MOCK_URLS = [urlObj, ...MOCK_URLS];
        res.status(201).json(urlObj);
      }
    } catch (error) {
      console.error('Airtable Create Error:', error);
      res.status(500).json({ error: 'Failed' });
    }
  });

  app.patch('/api/urls/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      if (airtableBase) {
        const record = await airtableBase(AIRTABLE_TABLE_NAME).update([
          { id, fields: updates }
        ]);
        res.json({ id: record[0].id, ...record[0].fields });
      } else {
        const index = MOCK_URLS.findIndex(u => u.id === id);
        if (index !== -1) {
          MOCK_URLS[index] = { ...MOCK_URLS[index], ...updates };
          res.json(MOCK_URLS[index]);
        } else {
          res.status(404).json({ error: 'Not found' });
        }
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  app.delete('/api/urls/:id', async (req, res) => {
    const { id } = req.params;
    try {
      if (airtableBase) {
        await airtableBase(AIRTABLE_TABLE_NAME).destroy([id]);
        res.status(204).send();
      } else {
        const index = MOCK_URLS.findIndex(u => u.id === id);
        if (index !== -1) {
          MOCK_URLS.splice(index, 1);
          res.status(204).send();
        } else {
          res.status(404).json({ error: 'Not found' });
        }
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
