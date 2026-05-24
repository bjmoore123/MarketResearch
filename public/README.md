# Deploying Atlas into your existing Express server

This bundle is a drop-in replacement for `public/index.html` in your existing `market-intelligence/` server. It uses your already-wired `/api/anthropic` proxy for live Claude analysis and (optionally) `/api/dfs/keywords` + `/api/dfs/serp` for live DataForSEO keyword & SERP data.

## Files

| File              | Purpose                                                            |
|-------------------|--------------------------------------------------------------------|
| `index.html`      | Entry point. Loads fonts, Leaflet, React, Babel, then the app.     |
| `data.js`         | The 50-metro × 50-niche static dataset (used by the map + table).  |
| `atlas-app.jsx`   | The Atlas UI + live `runDeepAnalysis()` that calls your APIs.      |
| `tweaks-panel.jsx`| Floating Tweaks control (accent, paper tone, density, table rows). |

## Steps

```bash
# 1. From your market-intelligence/ project root
cp /path/to/deploy/*.{html,js,jsx} public/

# 2. (Your existing index.html will be overwritten — back it up if you want.)
mv public/index.html public/index.html  # already named correctly

# 3. Make sure your .env has the keys your server already expects:
#    ANTHROPIC_API_KEY=sk-ant-...
#    DATAFORSEO_LOGIN=...           (optional — falls back gracefully)
#    DATAFORSEO_PASSWORD=...

# 4. Run it
npm start
# → http://localhost:3000

# Or with your existing Docker setup:
docker compose up --build
```

## What it does on "Run deep analysis"

1. **Optionally** fetches DataForSEO keyword volume + SERP top-10 in parallel (skipped if DFS isn't configured).
2. **Always** calls `/api/anthropic` with a structured prompt asking Claude for the four-phase scoring, signals, and executive brief — feeding in live DFS numbers when available so Claude scores against real data.
3. Parses Claude's JSON response, computes the weighted score, classifies SERP results, and renders the modal.

If DFS is offline, Claude's estimates fill in. If Claude returns malformed JSON or the proxy errors, the loader switches to an error state with the message — no silent failures.

## Tweaking the model

`atlas-app.jsx` currently calls `model: 'claude-sonnet-4-5'` with `max_tokens: 1500`. Change in `runDeepAnalysis()` (search for `model:`).

## Production hardening (recommended next steps)

The bundle uses in-browser Babel for JSX — fine for an internal tool, slow for public traffic. To pre-compile:

```bash
# In your project root
npm install --save-dev esbuild
npx esbuild public/atlas-app.jsx --bundle --outfile=public/atlas-app.js --loader:.jsx=jsx
```

Then change `<script type="text/babel" src="atlas-app.jsx">` to `<script src="atlas-app.js">` and drop the `@babel/standalone` script tag.

## File contracts

The server endpoints this app uses are exactly the ones your existing `server.js` already exposes:

- `GET  /api/status`               → `{ anthropic: boolean, dataforseo: boolean }`
- `POST /api/anthropic`            → transparent proxy to `https://api.anthropic.com/v1/messages`
- `GET  /api/dfs/keywords?keywords=…` → `{ keywords: [{ keyword, volume, competition_index, cpc }] }`
- `GET  /api/dfs/serp?keyword=…`   → `{ positions: [{ position, url, domain_rank, backlinks, … }] }`

No new server routes needed.
