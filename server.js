const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Helpers ──────────────────────────────────────────────
function dfsAuth() {
  const login    = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

async function dfsPost(path, body) {
  const res  = await fetch(`https://api.dataforseo.com${path}`, {
    method  : 'POST',
    headers : { 'Authorization': dfsAuth(), 'Content-Type': 'application/json' },
    body    : JSON.stringify(body),
  });
  const raw = await res.text();
  try { return { status: res.status, ok: res.ok, data: JSON.parse(raw) }; }
  catch { return { status: res.status, ok: false, data: null, raw: raw.slice(0, 200) }; }
}

// ─── Status ───────────────────────────────────────────────
app.get('/api/status', (_req, res) => {
  res.json({
    anthropic  : !!process.env.ANTHROPIC_API_KEY,
    dataforseo : !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD),
  });
});

// ─── Anthropic proxy ──────────────────────────────────────
app.post('/api/anthropic', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not set.' } });
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body    : JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// ─── DataForSEO — Keyword volume + competition ────────────
// GET /api/dfs/keywords?keywords=kw1,kw2,kw3&country=us
// Returns: { keywords: [{ keyword, volume, competition_index, cpc, monthly_searches }] }
app.get('/api/dfs/keywords', async (req, res) => {
  if (!process.env.DATAFORSEO_LOGIN) return res.status(503).json({ dfs_error: true, message: 'DataForSEO not configured.' });

  const { keywords } = req.query;
  if (!keywords) return res.status(400).json({ error: 'keywords param required' });

  const kwArray = keywords.split(',').map(k => k.trim()).filter(Boolean);

  const { status, ok, data, raw } = await dfsPost(
    '/v3/keywords_data/google_ads/search_volume/live',
    [{ keywords: kwArray, location_code: 2840, language_code: 'en' }]
  );

  if (!ok || !data) {
    console.error('DataForSEO keywords error:', raw || data);
    return res.status(status).json({ dfs_error: true, message: data?.status_message || raw || 'Unknown error' });
  }

  const results = data.tasks?.[0]?.result || [];
  const mapped  = kwArray.map(kw => {
    const r = results.find(r => r.keyword?.toLowerCase() === kw.toLowerCase());
    return {
      keyword            : kw,
      volume             : r?.search_volume             || 0,
      competition_index  : r?.competition_index         || 0,   // 0–100, Google Ads competition
      cpc                : r?.cpc                       || 0,
      monthly_searches   : r?.monthly_searches          || [],
    };
  });

  res.json({ keywords: mapped });
});

// ─── DataForSEO — SERP overview ───────────────────────────
// GET /api/dfs/serp?keyword=best+hvac+in+charlotte&country=us
// Returns: { positions: [{ position, url, domain, domain_rank, referring_domains, backlinks, title }] }
app.get('/api/dfs/serp', async (req, res) => {
  if (!process.env.DATAFORSEO_LOGIN) return res.status(503).json({ dfs_error: true, message: 'DataForSEO not configured.' });

  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: 'keyword param required' });

  const { status, ok, data, raw } = await dfsPost(
    '/v3/serp/google/organic/live/advanced',
    [{ keyword, location_code: 2840, language_code: 'en', depth: 10, se_domain: 'google.com' }]
  );

  if (!ok || !data) {
    console.error('DataForSEO SERP error:', raw || data);
    return res.status(status).json({ dfs_error: true, message: data?.status_message || raw || 'Unknown error' });
  }

  const items   = data.tasks?.[0]?.result?.[0]?.items || [];
  const organic = items.filter(i => i.type === 'organic').slice(0, 10);

  const positions = organic.map(item => ({
    position          : item.rank_group,
    url               : item.url,
    title             : item.title,
    domain            : item.domain,
    domain_rank       : item.backlinks_info?.rank                        || 0,  // DataForSEO Rank (≈ DR)
    referring_domains : item.backlinks_info?.referring_domains           || 0,
    backlinks         : item.backlinks_info?.backlinks                   || 0,
  }));

  res.json({ positions });
});

// ─── DataForSEO — Batch scan (regional opportunities) ─────
// POST /api/dfs/scan  body: { categories: [{ name, primary_query }] }
// Fetches keyword volume for all queries in one call, returns enriched + sorted categories
app.post('/api/dfs/scan', async (req, res) => {
  if (!process.env.DATAFORSEO_LOGIN) return res.status(503).json({ dfs_error: true, message: 'DataForSEO not configured.' });

  const { categories } = req.body;
  if (!Array.isArray(categories) || !categories.length) return res.status(400).json({ error: 'categories array required' });

  const queries = categories.map(c => c.primary_query || `best ${c.name}`);

  const { status, ok, data, raw } = await dfsPost(
    '/v3/keywords_data/google_ads/search_volume/live',
    [{ keywords: queries, location_code: 2840, language_code: 'en' }]
  );

  if (!ok || !data) {
    console.error('DataForSEO scan error:', raw || data);
    return res.status(status).json({ dfs_error: true, message: data?.status_message || raw });
  }

  const results  = data.tasks?.[0]?.result || [];
  const enriched = categories.map((cat, i) => {
    const r   = results.find(r => r.keyword?.toLowerCase() === queries[i].toLowerCase()) || {};
    const vol = r.search_volume      || 0;
    const kd  = r.competition_index  || 50;
    return {
      ...cat,
      dataforseo: { volume: vol, competition_index: kd, cpc: r.cpc || 0 },
      dfs_score : parseFloat(((vol / 100) * (1 - kd / 100) * 10).toFixed(2)),
    };
  });

  enriched.sort((a, b) => b.dfs_score - a.dfs_score);
  res.json({ categories: enriched });
});

// ─── DataForSEO — Plan diagnostic ─────────────────────────
app.get('/api/dfs/plan', async (req, res) => {
  if (!process.env.DATAFORSEO_LOGIN) return res.status(503).json({ error: 'DataForSEO not configured.' });
  const results = {};

  // Test keywords endpoint
  const kw = await dfsPost('/v3/keywords_data/google_ads/search_volume/live',
    [{ keywords: ['test'], location_code: 2840, language_code: 'en' }]);
  results.keywords = { status: kw.status, ok: kw.ok, tasks_error: kw.data?.tasks?.[0]?.status_message };

  // Test SERP endpoint
  const serp = await dfsPost('/v3/serp/google/organic/live/advanced',
    [{ keyword: 'test', location_code: 2840, language_code: 'en', depth: 1 }]);
  results.serp = { status: serp.status, ok: serp.ok, tasks_error: serp.data?.tasks?.[0]?.status_message };

  res.json(results);
});

// ─── SPA fallback ──────────────────────────────────────────
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n◉ Market Intelligence → http://localhost:${PORT}`);
  console.log(`  Anthropic   : ${process.env.ANTHROPIC_API_KEY                                             ? '✓ configured' : '✗ ANTHROPIC_API_KEY missing'}`);
  console.log(`  DataForSEO  : ${process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD           ? '✓ configured' : '○ not configured (optional)'}\n`);
});
