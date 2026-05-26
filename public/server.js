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


// ─── DataForSEO — Market Pulse ────────────────────────────
// POST /api/dfs/market-pulse
// body: { metros:[{id,name,state}], categories:[{id,name}] }
// One DFS call for all combos; returns volume matrix sorted by total desc.
app.post('/api/dfs/market-pulse', async (req, res) => {
  if (!process.env.DATAFORSEO_LOGIN)
    return res.status(503).json({ dfs_error: true, message: 'DataForSEO not configured.' });

  const { metros = [], categories = [] } = req.body;
  if (!metros.length || !categories.length)
    return res.status(400).json({ error: 'metros and categories arrays required' });

  // Build keyword list: "best {category} in {city} {state}"
  const combos = [];
  metros.forEach(m => {
    // Use kwName (clean ASCII, no en-dashes) so queries match keyword DB entries
    const geo = (m.kwName || `${m.name} ${m.state}`).toLowerCase();
    categories.forEach(c => {
      combos.push({ metro_id: m.id, category_id: c.id,
        keyword: `best ${c.name.toLowerCase()} in ${geo}` });
    });
  });

  // Chunk into ≤700-keyword DFS tasks
  const CHUNK = 700;
  const allResults = [];
  for (let i = 0; i < combos.length; i += CHUNK) {
    const chunk = combos.slice(i, i + CHUNK);
    const { status, ok, data, raw } = await dfsPost(
      '/v3/keywords_data/google_ads/search_volume/live',
      [{ keywords: chunk.map(c => c.keyword), location_code: 2840, language_code: 'en' }]
    );
    if (!ok || !data) {
      console.error('Market Pulse error:', raw || data);
      return res.status(status).json({ dfs_error: true, message: data?.status_message || raw });
    }
    allResults.push(...(data.tasks?.[0]?.result || []));
  }

  // Build lookup
  const volMap = {};
  allResults.forEach(r => { if (r?.keyword) volMap[r.keyword.toLowerCase()] = r; });

  // Assemble matrix
  const matrix = categories.map(cat => {
    const metroData = {};
    let total = 0;
    metros.forEach(m => {
      const geo = (m.kwName || `${m.name} ${m.state}`).toLowerCase();
      const kw  = `best ${cat.name.toLowerCase()} in ${geo}`;
      const r   = volMap[kw];
      const vol = r?.search_volume || 0;
      metroData[m.id] = { volume: vol, competition_index: r?.competition_index || 0, cpc: r?.cpc || 0, keyword: kw };
      total += vol;
    });
    return { category: cat, metros: metroData, total_volume: total };
  });

  matrix.sort((a, b) => b.total_volume - a.total_volume);
  res.json({ metros, categories, matrix, generated_at: new Date().toISOString() });
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

// ─── Census ACS — Enrich city scores ─────────────────────
// GET /api/census/enrich?state_fips=37
// Fetches ACS5 median income + population for all places in a state,
// returns normalised demand/paying scores for matching against cities.js
app.get('/api/census/enrich', async (req, res) => {
  const key = process.env.CENSUS_API_KEY;
  if (!key) return res.status(503).json({ error: 'CENSUS_API_KEY not configured.' });

  const { state_fips } = req.query;
  if (!state_fips) return res.status(400).json({ error: 'state_fips required' });

  try {
    // ACS 5-Year: population, median income, housing units, owner-occupied housing
    const vars = 'B01001_001E,B19013_001E,B25001_001E,B25003_002E';
    const url  = `https://api.census.gov/data/2022/acs/acs5?get=NAME,${vars}&for=place:*&in=state:${state_fips}&key=${key}`;
    const r    = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: `Census API ${r.status}` });
    const rows = await r.json();

    // rows[0] = header; rows[1..] = data
    const [header, ...data] = rows;
    const col = (name) => header.indexOf(name);

    const places = data.map(row => {
      const name        = row[col('NAME')]?.replace(/ city,.*| town,.*| CDP,.*/, '').trim();
      const pop         = parseInt(row[col('B01001_001E')]) || 0;
      const income      = parseInt(row[col('B19013_001E')]) || 0;
      const housing     = parseInt(row[col('B25001_001E')]) || 0;
      const owned       = parseInt(row[col('B25003_002E')]) || 0;
      const ownedRatio  = housing > 0 ? owned / housing : 0;

      // Normalise to 1-10 scores
      const payingScore  = Math.min(10, Math.max(1, Math.round((income - 25000) / 9000 + 1)));
      // Demand proxy: homeownership rate (more owners = more home service demand)
      const demandScore  = Math.min(10, Math.max(1, Math.round(ownedRatio * 10)));

      return { name, state_fips, pop, income, owned_ratio: ownedRatio.toFixed(2),
               paying: payingScore, demand: demandScore };
    }).filter(p => p.pop >= 50000); // only larger places

    res.json({ state_fips, count: places.length, places,
               fetched_at: new Date().toISOString() });
  } catch (e) {
    console.error('Census enrich error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── Census — Batch enrich all cities ────────────────────
// POST /api/census/enrich-all
// Fetches all unique state_fips from the request body cities array,
// runs ACS queries in parallel, returns merged enriched city list.
// Score helpers (Census → 1–10)
function incomeScore(v) { return Math.min(10, Math.max(1, Math.round((v-25000)/10000+1))); }
function growthScore(pct) {
  if (pct >= 10) return 10; if (pct >= 7) return 9; if (pct >= 5) return 8;
  if (pct >= 3)  return 7;  if (pct >= 1.5) return 6; if (pct >= 0) return 5;
  if (pct >= -1) return 4;  if (pct >= -3) return 3;  return 2;
}

app.post('/api/census/enrich-all', async (req, res) => {
  const key = process.env.CENSUS_API_KEY;
  if (!key) return res.status(503).json({ error: 'CENSUS_API_KEY not configured.' });
  const { cities } = req.body;
  if (!Array.isArray(cities)) return res.status(400).json({ error: 'cities array required' });
  const stateFips = [...new Set(cities.map(c => c.state_fips).filter(Boolean))];
  try {
    const acsData = {}, decData = {};
    await Promise.all(stateFips.flatMap(fips => [
      // ACS 2022: pop + median income
      (async () => {
        const r = await fetch(`https://api.census.gov/data/2022/acs/acs5?get=NAME,B01001_001E,B19013_001E&for=place:*&in=state:${fips}&key=${key}`);
        if (!r.ok) { acsData[fips]=[]; return; }
        const [h,...rows] = await r.json();
        const c = n => h.indexOf(n);
        acsData[fips] = rows.map(row=>({ name:row[c('NAME')]?.replace(/ city,.*| town,.*| CDP,.*/,'').trim().toLowerCase(), pop22:+row[c('B01001_001E')]||0, income:+row[c('B19013_001E')]||0 }));
      })(),
      // Decennial 2020: pop baseline for growth %
      (async () => {
        const r = await fetch(`https://api.census.gov/data/2020/dec/pl?get=NAME,P1_001N&for=place:*&in=state:${fips}&key=${key}`);
        if (!r.ok) { decData[fips]=[]; return; }
        const [h,...rows] = await r.json();
        const c = n => h.indexOf(n);
        decData[fips] = rows.map(row=>({ name:row[c('NAME')]?.replace(/ city,.*| town,.*| CDP,.*/,'').trim().toLowerCase(), pop20:+row[c('P1_001N')]||0 }));
      })(),
    ]));
    const match = (rows, name) => rows.find(r=>r.name===name) || rows.find(r=>r.name.startsWith(name)) || rows.find(r=>name.startsWith(r.name));
    const enriched = cities.map(city => {
      const n = city.name.toLowerCase();
      const acs = match(acsData[city.state_fips]||[], n);
      const dec = match(decData[city.state_fips]||[], n);
      if (!acs) return { ...city, census_matched:false };
      const pct = dec?.pop20>0 ? ((acs.pop22-dec.pop20)/dec.pop20)*100 : null;
      return { ...city, census_matched:true, census_income:acs.income, census_pop_2022:acs.pop22, census_pop_2020:dec?.pop20||0, growth_pct_3yr:pct!==null?+pct.toFixed(2):null, income:incomeScore(acs.income), growth:pct!==null?growthScore(pct):city.growth };
    });
    res.json({ enriched, fetched_at:new Date().toISOString(), matched:enriched.filter(c=>c.census_matched).length, total:enriched.length, note:'growth=ACS2022 vs Dec2020 pop change; income=ACS2022 median HH income' });
  } catch(e) { console.error('enrich-all error:',e.message); res.status(500).json({error:e.message}); }
});


app.post('/api/gap-finder', async (req, res) => {
  const { metro, standard_niches = [] } = req.body;
  if (!metro) return res.status(400).json({ error: 'metro required' });

  // ── Step 1: Claude generates hypotheses ──
  const growthLabel = metro.growth >= 7 ? 'rapid' : metro.growth >= 5 ? 'moderate' : 'slow/declining';
  const incomeLabel = metro.income  >= 7 ? 'high'  : metro.income  >= 5 ? 'medium'  : 'lower';
  const prompt = `You are a rank-and-rent lead generation expert identifying UNDERSERVED service business niches.

METRO: ${metro.name}, ${metro.state}
Population: ${(metro.pop||0).toLocaleString()}
Growth: ${growthLabel} | Income: ${incomeLabel} | Region: ${metro.region}
Demand score: ${metro.growth}/10 | Paying score: ${metro.income}/10

ALREADY SATURATED by rank-and-rent operators — DO NOT suggest these:
${standard_niches.join(', ')}

Find 15 service business categories that are:
1. NOT commonly rank-rented yet — most operators ignore them
2. Have real demand in ${metro.name} given its specific demographics/geography
3. Have high customer LTV (businesses would pay $200+/mo for exclusive leads)
4. Served by small businesses that already spend on ads/leads
5. High-urgency or high-frequency searches

Think about: senior services, specialty medical, niche legal, specialty trades, pet niches,
children's services, home tech services, specialty cleaning, wellness, specialty auto,
real estate adjacent, financial services, cultural/demographic-specific services.

Return ONLY a JSON array — no markdown, no extra text:
[{"name":"Category Name","primary_query":"best [category] in ${metro.name} ${metro.state}","ltv":"$X,XXX","rental_est":"$XXX-XXX/mo","rationale":"1-2 sentences on why this works in ${metro.name} and why it is underserved","urgency":"High|Medium"}]`;

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method : 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY,
                 'anthropic-version':'2023-06-01' },
      body   : JSON.stringify({ model:'claude-opus-4-5', max_tokens:2000,
                                messages:[{role:'user',content:prompt}] }),
    });
    const cData    = await claudeRes.json();
    const cText    = cData.content?.map(b=>b.text||'').join('').trim();
    const cJson    = cText.replace(/```json|```/g,'').trim().match(/\[[\s\S]*\]/)?.[0];
    if (!cJson) return res.status(500).json({ error: 'Claude returned no JSON', raw: cText.slice(0,300) });
    const hypotheses = JSON.parse(cJson);

    // ── Step 2: DFS validates volume (if configured) ──
    let enriched = hypotheses.map(h => ({ ...h, volume: null, competition_index: null }));
    if (process.env.DATAFORSEO_LOGIN) {
      const queries  = hypotheses.map(h => h.primary_query);
      const { ok, data } = await dfsPost(
        '/v3/keywords_data/google_ads/search_volume/live',
        [{ keywords: queries, location_code: 2840, language_code: 'en' }]
      );
      if (ok && data?.tasks?.[0]?.result) {
        const volMap = {};
        data.tasks[0].result.forEach(r => { if (r?.keyword) volMap[r.keyword.toLowerCase()] = r; });
        enriched = hypotheses.map(h => {
          const r = volMap[h.primary_query.toLowerCase()];
          return { ...h, volume: r?.search_volume||0, competition_index: r?.competition_index||null,
                   cpc: r?.cpc||null };
        });
        // Sort by volume desc
        enriched.sort((a,b) => (b.volume||0)-(a.volume||0));
      }
    }

    res.json({ metro, hypotheses: enriched, generated_at: new Date().toISOString(),
               dfs_validated: !!process.env.DATAFORSEO_LOGIN });
  } catch (e) {
    console.error('Gap finder error:', e.message);
    res.status(500).json({ error: e.message });
  }
});
