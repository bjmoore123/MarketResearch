const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// Status — lets the UI know which keys are live
// ─────────────────────────────────────────────
app.get('/api/status', (_req, res) => {
  res.json({
    anthropic : !!process.env.ANTHROPIC_API_KEY,
    ahrefs    : !!process.env.AHREFS_API_KEY,
  });
});

// ─────────────────────────────────────────────
// Anthropic proxy
// ─────────────────────────────────────────────
app.post('/api/anthropic', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not set in environment.' } });

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method  : 'POST',
      headers : {
        'Content-Type'      : 'application/json',
        'x-api-key'         : key,
        'anthropic-version' : '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('Anthropic proxy error:', err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});

// ─────────────────────────────────────────────
// Ahrefs — Keywords Explorer
// GET /api/ahrefs/keywords?keywords=kw1,kw2&country=us
// Returns per-keyword: volume, difficulty, clicks_per_search, cpc
// ─────────────────────────────────────────────
app.get('/api/ahrefs/keywords', async (req, res) => {
  const key = process.env.AHREFS_API_KEY;
  if (!key) return res.status(503).json({ error: 'AHREFS_API_KEY not configured.' });

  const { keywords, country = 'us' } = req.query;
  if (!keywords) return res.status(400).json({ error: 'keywords param required' });

  try {
    const params = new URLSearchParams({
      select  : 'volume,difficulty,clicks_per_search,cpc,global_volume,parent_topic',
      country,
      keywords,
    });
    const upstream = await fetch(
      `https://api.ahrefs.com/v3/keywords-explorer/overview?${params}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    const data = await upstream.json();
    if (!upstream.ok) {
      console.error('Ahrefs keywords error:', data);
      return res.status(upstream.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error('Ahrefs keywords proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Ahrefs — SERP Overview
// GET /api/ahrefs/serp?keyword=best+hvac+in+charlotte&country=us
// Returns top-10 positions with DR, backlinks, traffic
// ─────────────────────────────────────────────
app.get('/api/ahrefs/serp', async (req, res) => {
  const key = process.env.AHREFS_API_KEY;
  if (!key) return res.status(503).json({ error: 'AHREFS_API_KEY not configured.' });

  const { keyword, country = 'us' } = req.query;
  if (!keyword) return res.status(400).json({ error: 'keyword param required' });

  try {
    const params = new URLSearchParams({
      select  : 'url,title,domain_rating,backlinks,traffic,position',
      country,
      keyword,
    });
    const upstream = await fetch(
      `https://api.ahrefs.com/v3/serp-overview?${params}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    const data = await upstream.json();
    if (!upstream.ok) {
      console.error('Ahrefs SERP error:', data);
      return res.status(upstream.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error('Ahrefs SERP proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Ahrefs — batch keyword + SERP for a metro scan
// POST /api/ahrefs/scan  body: { geo, categories: [{name, primary_query}] }
// Returns enriched categories with real volume + KD, sorted by opportunity
// ─────────────────────────────────────────────
app.post('/api/ahrefs/scan', async (req, res) => {
  const key = process.env.AHREFS_API_KEY;
  if (!key) return res.status(503).json({ error: 'AHREFS_API_KEY not configured.' });

  const { categories } = req.body;
  if (!Array.isArray(categories) || !categories.length) {
    return res.status(400).json({ error: 'categories array required' });
  }

  try {
    // Batch all primary queries in one Ahrefs call
    const queries = categories.map(c => c.primary_query || `best ${c.name}`);
    const params  = new URLSearchParams({
      select   : 'volume,difficulty,clicks_per_search,cpc',
      country  : 'us',
      keywords : queries.join(','),
    });
    const upstream = await fetch(
      `https://api.ahrefs.com/v3/keywords-explorer/overview?${params}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(data);

    // Merge Ahrefs data back into categories
    const enriched = categories.map((cat, i) => {
      const kw = data.keywords?.[i] || {};
      const vol = kw.volume   || 0;
      const kd  = kw.difficulty || 50;
      // Opportunity = volume weighted by inverse difficulty
      const ahrefsScore = Math.round((vol / 100) * (1 - kd / 100) * 10) / 10;
      return {
        ...cat,
        ahrefs: {
          volume             : vol,
          keyword_difficulty : kd,
          clicks_per_search  : kw.clicks_per_search,
          cpc                : kw.cpc,
        },
        ahrefs_score: ahrefsScore,
      };
    });

    // Sort by Ahrefs opportunity score descending
    enriched.sort((a, b) => b.ahrefs_score - a.ahrefs_score);
    res.json({ categories: enriched });
  } catch (err) {
    console.error('Ahrefs scan error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// SPA fallback
// ─────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n◉ Market Intelligence running → http://localhost:${PORT}`);
  console.log(`  Anthropic : ${process.env.ANTHROPIC_API_KEY ? '✓ configured' : '✗ ANTHROPIC_API_KEY missing'}`);
  console.log(`  Ahrefs    : ${process.env.AHREFS_API_KEY    ? '✓ configured' : '○ not configured (optional)'}\n`);
});
