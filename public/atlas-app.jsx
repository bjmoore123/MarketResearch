/* global React, L */

// ── Dual-thumb range slider ───────────────────────────────────────────────
// Two overlapping <input type=range> share one visual track.
// Lower thumb: accent color. Upper thumb: dimmer.
function DualRangeSlider({ steps, lo, hi, onChangeLo, onChangeHi, format, tokens }) {
  const loIdx = steps.reduce((bi,s,i) => Math.abs(s-lo) < Math.abs(steps[bi]-lo) ? i : bi, 0);
  const hiIdx = steps.reduce((bi,s,i) => Math.abs(s-hi) < Math.abs(steps[bi]-hi) ? i : bi, 0);
  const n     = steps.length - 1;
  const pctLo = (loIdx / n * 100).toFixed(1);
  const pctHi = (hiIdx / n * 100).toFixed(1);

  const base = {
    position:'absolute', width:'100%', height:'4px', top:'50%',
    transform:'translateY(-50%)', outline:'none', cursor:'pointer',
    WebkitAppearance:'none', appearance:'none', background:'transparent',
    pointerEvents:'none',
  };

  return (
    <div>
      <style>{`
        .drs-lo::-webkit-slider-thumb,.drs-hi::-webkit-slider-thumb{
          -webkit-appearance:none;width:16px;height:16px;border-radius:50%;
          cursor:pointer;pointer-events:all;border:2px solid #fff;
          box-shadow:0 1px 5px rgba(0,0,0,0.4);
        }
        .drs-lo::-webkit-slider-thumb{background:var(--drs-accent,#6a9e6a);}
        .drs-hi::-webkit-slider-thumb{background:var(--drs-dim,#999);}
        .drs-lo::-moz-range-thumb,.drs-hi::-moz-range-thumb{
          width:16px;height:16px;border-radius:50%;cursor:pointer;
          border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.4);
        }
        .drs-lo::-moz-range-thumb{background:var(--drs-accent,#6a9e6a);}
        .drs-hi::-moz-range-thumb{background:var(--drs-dim,#999);}
      `}</style>
      {/* Track container */}
      <div style={{ position:'relative', height:24,
                    '--drs-accent':tokens.accent, '--drs-dim':tokens.dim }}>
        {/* Base track */}
        <div style={{ position:'absolute', top:'50%', left:0, right:0, height:4,
                      transform:'translateY(-50%)', background:tokens.card, borderRadius:2 }}>
          {/* Active range fill */}
          <div style={{ position:'absolute', left:`${pctLo}%`, width:`${pctHi - pctLo}%`,
                        height:'100%', background:tokens.accent, borderRadius:2, opacity:.7 }}/>
        </div>
        {/* Lo thumb */}
        <input type="range" min={0} max={n} value={loIdx} className="drs-lo"
          style={base}
          onChange={e => { const i=+e.target.value; if(i<=hiIdx) onChangeLo(steps[i]); }}/>
        {/* Hi thumb */}
        <input type="range" min={0} max={n} value={hiIdx} className="drs-hi"
          style={base}
          onChange={e => { const i=+e.target.value; if(i>=loIdx) onChangeHi(steps[i]); }}/>
      </div>
      {/* Labels */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6,
                    fontFamily:tokens.mono, fontSize:9 }}>
        {steps.map((s,i) => (
          <span key={i} style={{
            color: (i>=loIdx && i<=hiIdx) ? tokens.accent : tokens.dim,
            fontWeight: (i===loIdx||i===hiIdx) ? 700 : 400,
          }}>{format(s)}</span>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// ATLAS — light editorial cartographic
// Cream paper, ink type, Newsreader display, sage accent.
// Map fills the upper canvas, ranked table is the hero below.
// ═══════════════════════════════════════════════════════════


// Palettes per tweak. Each is a curated set of values that all hang together.
const ATLAS_PALETTES = {
  cream:  { paper: '#f1ece0', card: '#f7f3e8', cardHi: '#fbf8ed' },
  bone:   { paper: '#eeebe3', card: '#f6f3eb', cardHi: '#fbf8f0' },
  mist:   { paper: '#e8ebe6', card: '#f1f3ee', cardHi: '#f6f8f4' },
  evening:{ paper: '#1b1d22', card: '#23262d', cardHi: '#292d36' },
};
const ATLAS_INK = {
  cream:  { ink:'#1a1d23', ink2:'#3d4148', muted:'#6b6f76', dim:'#9da0a6', rule:'rgba(26,29,35,0.10)',  ruleHi:'rgba(26,29,35,0.18)' },
  bone:   { ink:'#1a1d23', ink2:'#3d4148', muted:'#6b6f76', dim:'#9da0a6', rule:'rgba(26,29,35,0.10)',  ruleHi:'rgba(26,29,35,0.18)' },
  mist:   { ink:'#15201a', ink2:'#374038', muted:'#646b66', dim:'#969c98', rule:'rgba(20,30,25,0.10)',  ruleHi:'rgba(20,30,25,0.18)' },
  evening:{ ink:'#ecebe6', ink2:'#c4c1b8', muted:'#8a8780', dim:'#5d5b54', rule:'rgba(255,255,255,0.08)', ruleHi:'rgba(255,255,255,0.16)' },
};
const ATLAS_ACCENTS = {
  sage:      { accent:'#2f8f6a', sweet:'#2f8f6a', growth:'#3a6b8f', comp:'#b08a3e', watch:'#a09e98', bad:'#b54b35' },
  ocean:     { accent:'#2a6fa3', sweet:'#2a6fa3', growth:'#5b9c6e', comp:'#b08a3e', watch:'#a09e98', bad:'#b54b35' },
  amber:     { accent:'#b8782a', sweet:'#5b8a52', growth:'#3a6b8f', comp:'#b8782a', watch:'#a09e98', bad:'#b54b35' },
  terracotta:{ accent:'#b85a3a', sweet:'#5b8a52', growth:'#3a6b8f', comp:'#b85a3a', watch:'#a09e98', bad:'#9a3e22' },
};
const ATLAS_BASE_TYPE = {
  display: "'Newsreader', Georgia, serif",
  sans:    "'Geist', -apple-system, system-ui, sans-serif",
  mono:    "'Geist Mono', 'JetBrains Mono', monospace",
};

function makeAtlasTokens(t) {
  const paper = ATLAS_PALETTES[t.paperTone] || ATLAS_PALETTES.cream;
  const ink   = ATLAS_INK[t.paperTone]      || ATLAS_INK.cream;
  const acc   = ATLAS_ACCENTS[t.accent]     || ATLAS_ACCENTS.sage;
  return { ...paper, ...ink, ...acc, ...ATLAS_BASE_TYPE };
}

let atlasTokens = makeAtlasTokens({ paperTone:'cream', accent:'sage' });

function atlasQuadColors() {
  return {
    sweet:  atlasTokens.sweet,
    growth: atlasTokens.growth,
    comp:   atlasTokens.comp,
    watch:  atlasTokens.watch,
  };
}
const ATLAS_QUAD_COLORS = new Proxy({}, { get: (_, k) => atlasQuadColors()[k] });

// ─── Leaflet map hook ──────────────────────────────────────
function useAtlasMap(containerId, { selected, setSelected, nicheFilters, quadrantFilters, setViewportIds }) {
  const mapRef = React.useRef(null);
  const markersRef = React.useRef({});

  React.useEffect(() => {
    const el = document.getElementById(containerId);
    if (!el || mapRef.current) return;
    const map = L.map(el, {
      center: [39.5, -97], zoom: 4, zoomControl: false,
      attributionControl: false, scrollWheelZoom: false, dragging: true,
      doubleClickZoom: false, keyboard: false,
    });
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
      { maxZoom: 18, subdomains: 'abcd' }
    ).addTo(map);
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      { maxZoom: 18, subdomains: 'abcd', opacity: 0.55 }
    ).addTo(map);
    mapRef.current = map;

    window.METROS.forEach(m => {
      const q = window.MIutil.quadrant(m.growth, m.income);
      const color = ATLAS_QUAD_COLORS[q.key];
      const radius = Math.max(7, Math.min(22, 5 + Math.log10(m.pop / 50000) * 5));
      const marker = L.circleMarker([m.lat, m.lng], {
        radius, fillColor: color, fillOpacity: 0.78,
        color: '#fff', weight: 1.5, opacity: 1,
      }).addTo(map);
      marker.on('click', () => setSelected(m.id));
      marker.bindTooltip(
        `<b style="font-family:${atlasTokens.display};font-size:14px;color:${atlasTokens.ink}">${m.name}, ${m.state}</b><br><span style="font-family:${atlasTokens.mono};font-size:10px;color:${atlasTokens.muted}">Demand ${m.growth} · Paying ${m.income} · ${q.label}</span>`,
        { className: 'atlas-tip', direction: 'top', offset: [0, -6] }
      );
      markersRef.current[m.id] = { marker, color, radius, metro: m };
    });

    setTimeout(() => map.invalidateSize(), 80);

    // Expose flyTo so table-click can zoom the map
    window._atlasFlyTo = (lat, lng, zoom) => {
      map.flyTo([lat, lng], zoom ?? 11, { duration: 1.0, easeLinearity: 0.35 });
    };

    // ═══════════════════════════════════════════════════════════
    // CITY MARKERS — created once on init, always visible
    // ═══════════════════════════════════════════════════════════
    window._atlasCityMarkers = {};
    const cityMarkersRef = window._atlasCityMarkers;

    (window.CITIES || []).forEach(city => {
      try {
      if (!city.lat || !city.lng) return;
      const q   = window.MIutil.quadrant(city.growth, city.income);
      const col = q.color || 'rgba(180,180,180,0.5)';
      // Radius: 50k=5, 100k=7, 250k=9, 500k=11, 1M=13
      const r   = Math.max(5, Math.min(13, 4 + Math.log10((city.pop||50000)/20000) * 5));
      const mk  = L.circleMarker([city.lat, city.lng], {
        radius: r, fillColor: col, fillOpacity: 0.7,
        color: col, weight: 1, opacity: 0.45,
      }).addTo(map);
      mk.bindTooltip(
        `<b>${city.name}, ${city.state}</b><br>` +
        `Pop: ${(city.pop||0).toLocaleString()}<br>` +
        `Growth: ${city.growth}/10 · Income: ${city.income}/10`,
        { className: 'metro-tooltip', direction: 'top', offset: [0,-4] }
      );
      mk.on('click', () => setSelected(city.id));
      cityMarkersRef[city.id] = { marker: mk, city };
      } catch(e) { console.warn('City marker error:', city?.name, e.message); }
    });

    // ═══════════════════════════════════════════════════════════
    // UNIFIED FILTER FUNCTION
    // Called from React whenever any filter changes AND on map move.
    // Handles pop range, quadrant, niche — all in one pass.
    // ═══════════════════════════════════════════════════════════
    window._applyMapFilters = function(opts) {
      const { minPop=0, maxPop=20000000, quadrantFilters={}, nicheFilters={}, nicheAll=[] } = opts;
      const anyQuad = Object.values(quadrantFilters).some(Boolean);
      const includes = Object.keys(nicheFilters).filter(id => nicheFilters[id]==='include')
        .map(id => nicheAll.find(n=>n.id===id)).filter(Boolean);
      const excludes = Object.keys(nicheFilters).filter(id => nicheFilters[id]==='exclude')
        .map(id => nicheAll.find(n=>n.id===id)).filter(Boolean);

      function visibility(entity) {
        const pop   = entity.pop || 0;
        const inPop = pop >= minPop && pop <= maxPop;
        if (!inPop) return false;
        const q      = window.MIutil.quadrant(entity.growth, entity.income);
        const inQuad = !anyQuad || !!quadrantFilters[q.key];
        if (!inQuad) return false;
        if (includes.length) {
          const strong = includes.some(n => window.MIutil.isStrong && window.MIutil.isStrong(n, entity) && entity.growth >= 6);
          if (!strong) return false;
        }
        if (excludes.length) {
          const excluded = excludes.some(n => window.MIutil.isStrong && window.MIutil.isStrong(n, entity) && entity.growth >= 6);
          if (excluded) return false;
        }
        return true;
      }

      // Metro markers
      Object.values(markersRef.current || {}).forEach(({ marker, metro }) => {
        const on = visibility(metro);
        marker.setStyle({ fillOpacity: on ? 0.78 : 0.07, opacity: on ? 1 : 0.07 });
      });
      // City markers
      Object.values(cityMarkersRef).forEach(({ marker, city }) => {
        const on = visibility(city);
        marker.setStyle({ fillOpacity: on ? 0.70 : 0.07, opacity: on ? 0.45 : 0.07 });
      });
    };

    // ═══════════════════════════════════════════════════════════
    // MAP MOVE → VIEWPORT STATE
    // Always includes cities so table filter works at all zoom levels.
    // ═══════════════════════════════════════════════════════════
    function onMapMove() {
      const bounds = map.getBounds();
      const inView = new Set();
      (window.METROS || []).forEach(m => {
        if (bounds.contains([m.lat, m.lng])) inView.add('metro:' + m.id);
      });
      (window.CITIES || []).forEach(c => {
        if (bounds.contains([c.lat, c.lng])) inView.add('city:' + c.id);
      });
      // Direct React state update — no events needed (hook has access to setter)
      setViewportIds(inView);
    }

    map.on('zoomend moveend', onMapMove);
    // Fire once after tiles load so table reflects initial viewport
    setTimeout(onMapMove, 400);

    return () => { map.remove(); mapRef.current = null; markersRef.current = {}; window._atlasViewport = null; window._atlasCityMarkers = {}; window._applyMapFilters = null; window._atlasFlyTo = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // selection & niche overlay
  React.useEffect(() => {
    const all = window.MIutil.niches();
    const filters = nicheFilters || {};
    const includes = Object.keys(filters).filter(id => filters[id] === 'include').map(id => all.find(n => n.id === id)).filter(Boolean);
    const excludes = Object.keys(filters).filter(id => filters[id] === 'exclude').map(id => all.find(n => n.id === id)).filter(Boolean);
    const qf = quadrantFilters || {};
    const anyQuadFilter = Object.values(qf).some(Boolean);
    const anyNicheFilter = includes.length > 0 || excludes.length > 0;
    const anyFilter = anyNicheFilter || anyQuadFilter;

    Object.entries(markersRef.current).forEach(([id, { marker, color, radius, metro }]) => {
      let fill = 0.78, op = 1, w = 1.5, c = '#fff', r = radius;
      if (anyFilter) {
        const q = window.MIutil.quadrant(metro.growth, metro.income);
        const quadOK = !anyQuadFilter || qf[q.key];
        const incOK = includes.length === 0 || includes.some(n => window.MIutil.isStrong(n, metro) && metro.growth >= 6);
        const excHit = excludes.some(n => window.MIutil.isStrong(n, metro) && metro.growth >= 6);
        const nicheOK = incOK && !excHit;

        if (!quadOK) {
          // Wrong quadrant — heavy fade
          fill = 0.10; op = 0.18; r = radius - 1;
        } else if (!nicheOK) {
          // Right quadrant, wrong niche — keep visible so the quadrant color still reads
          fill = 0.55; op = 0.55; r = radius;
        } else {
          // Match everything
          fill = 0.95; op = 1; r = radius + 1;
        }
      }
      if (id === selected) { w = 3; c = atlasTokens.ink; r = radius + 2; }
      marker.setStyle({ fillOpacity: fill, opacity: op, weight: w, color: c, radius: r, fillColor: color });
    });
  }, [selected, nicheFilters, quadrantFilters]);
}

// ─── Quadrant key chip ─────────────────────────────────────
function AtlasLegendItem({ swatch, label, sub, active, dim, onClick }) {
  const interactive = !!onClick;
  return (
    <button
      onClick={onClick}
      disabled={!interactive}
      title={interactive ? (active ? 'Click to deselect' : 'Click to add to filter') : undefined}
      style={{
        display:'flex', alignItems:'flex-start', gap:10, width:'100%',
        padding:'5px 8px', borderRadius:5, textAlign:'left',
        background: active ? `${swatch}1a` : 'transparent',
        border: `1px solid ${active ? swatch + '55' : 'transparent'}`,
        cursor: interactive ? 'pointer' : 'default',
        opacity: dim ? 0.38 : 1,
        transition: 'background .12s, opacity .12s',
      }}
    >
      <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:swatch, marginTop:5, flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:atlasTokens.sans, fontSize:12, color:atlasTokens.ink, fontWeight:500, lineHeight:1.2 }}>{label}</div>
        <div style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted, marginTop:2, letterSpacing:0.2 }}>{sub}</div>
      </div>
      {active && (
        <span style={{ fontFamily:atlasTokens.mono, fontSize:11, color:swatch, fontWeight:500, marginTop:3 }}>✓</span>
      )}
    </button>
  );
}

// ─── Niche chip column ─────────────────────────────────────
function AtlasNichePanel({ nicheFilters, setNicheFilter, clearAllFilters, pickNiche }) {
  const [openCats, setOpenCats] = React.useState({ home: true, health: false, legal: false, auto: false, pet: false, personal: false });
  const includeCount = Object.values(nicheFilters || {}).filter(v => v === 'include').length;
  const excludeCount = Object.values(nicheFilters || {}).filter(v => v === 'exclude').length;
  const anyActive = includeCount + excludeCount > 0;

  // Cycle through: undefined → include → exclude → undefined
  const cycle = (n, cat) => {
    const curr = nicheFilters?.[n.id];
    const next = curr === 'include' ? 'exclude' : curr === 'exclude' ? null : 'include';
    setNicheFilter(n.id, next, { ...n, cat });
    if (next === 'include' && pickNiche) pickNiche(n.id);
  };

  return (
    <div>
      {/* Active filter summary */}
      {anyActive && (
        <div style={{
          marginBottom:10, padding:'8px 10px', borderRadius:6,
          background: atlasTokens.card, border:`1px solid ${atlasTokens.rule}`,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
        }}>
          <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
            {includeCount > 0 && (
              <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.accent, letterSpacing:0.3 }}>
                +{includeCount} include
              </span>
            )}
            {excludeCount > 0 && (
              <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.bad, letterSpacing:0.3 }}>
                −{excludeCount} exclude
              </span>
            )}
          </div>
          <button onClick={clearAllFilters} style={{
            fontFamily:atlasTokens.mono, fontSize:9.5, padding:'2px 7px', borderRadius:3,
            background:'transparent', border:`1px solid ${atlasTokens.rule}`, color:atlasTokens.muted, cursor:'pointer',
            letterSpacing:0.3,
          }}>clear all</button>
        </div>
      )}

      {window.NICHE_CATS.map(cat => {
        const isOpen = openCats[cat.id];
        const catActiveCount = cat.niches.filter(n => nicheFilters?.[n.id]).length;
        return (
          <div key={cat.id} style={{ marginBottom:10 }}>
            <button
              onClick={() => setOpenCats(s => ({ ...s, [cat.id]: !s[cat.id] }))}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                width:'100%', padding:'7px 10px', borderRadius:6,
                background:'transparent', border:`1px solid ${atlasTokens.rule}`,
                fontFamily:atlasTokens.sans, fontSize:11, color:atlasTokens.ink,
                cursor:'pointer', textAlign:'left',
              }}
            >
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:cat.color }} />
                <span style={{ fontWeight:500, letterSpacing:0.1 }}>{cat.label}</span>
                {catActiveCount > 0 && (
                  <span style={{
                    fontFamily:atlasTokens.mono, fontSize:9, padding:'1px 5px', borderRadius:8,
                    background:`${cat.color}22`, color:cat.color, letterSpacing:0.2,
                  }}>{catActiveCount}</span>
                )}
              </span>
              <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted }}>
                {cat.niches.length} · {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div style={{ marginTop:4, padding:'4px 0 4px 4px', display:'flex', flexDirection:'column', gap:2 }}>
                {cat.niches.map(n => {
                  const state = nicheFilters?.[n.id]; // 'include' | 'exclude' | undefined
                  const isInc = state === 'include';
                  const isExc = state === 'exclude';
                  return (
                    <button
                      key={n.id}
                      onClick={() => cycle(n, cat)}
                      title={isInc ? 'Click to exclude' : isExc ? 'Click to clear' : 'Click to include'}
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'5px 8px 5px 12px', borderRadius:4, cursor:'pointer',
                        background: isInc ? `${cat.color}1a` : isExc ? `${atlasTokens.bad}10` : 'transparent',
                        borderLeft: `3px solid ${isInc ? cat.color : isExc ? atlasTokens.bad : 'transparent'}`,
                        border: 'none',
                        borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: isInc ? cat.color : isExc ? atlasTokens.bad : 'transparent',
                        fontFamily:atlasTokens.sans, fontSize:11.5,
                        color: isInc ? atlasTokens.ink : isExc ? atlasTokens.muted : atlasTokens.ink2,
                        textAlign:'left',
                        textDecoration: isExc ? 'line-through' : 'none',
                        textDecorationColor: isExc ? `${atlasTokens.bad}88` : 'inherit',
                      }}
                    >
                      <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{
                          width:14, height:14, borderRadius:3, flexShrink:0,
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          background: isInc ? cat.color : isExc ? atlasTokens.bad : 'transparent',
                          border: state ? 'none' : `1px solid ${atlasTokens.rule}`,
                          color: '#fff', fontFamily: atlasTokens.mono, fontSize: 10, fontWeight: 600, lineHeight: 1,
                        }}>
                          {isInc ? '+' : isExc ? '−' : ''}
                        </span>
                        <span>{n.name}</span>
                      </span>
                      <span style={{ fontFamily:atlasTokens.mono, fontSize:9.5, color:atlasTokens.dim }}>{n.rental}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Coach hint card (when nothing selected) ───────────────
function AtlasCoachHint({ topCombo, onAnalyze, allCombos, onSelectMetro, pickNiche }) {
  const { metro, niche, score } = topCombo;
  const runnerUps = (allCombos || []).slice(1, 4);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{
        background: atlasTokens.cardHi, border: `1px solid ${atlasTokens.rule}`, borderRadius:10,
        padding:'20px 22px', position:'relative',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:11 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:atlasTokens.accent, boxShadow:`0 0 0 4px ${atlasTokens.accent}22` }} />
          <span style={{ fontFamily:atlasTokens.mono, fontSize:9.5, letterSpacing:2, textTransform:'uppercase', color:atlasTokens.accent, fontWeight:500 }}>Analyst's pick · top of board</span>
        </div>
        <div style={{ fontFamily:atlasTokens.display, fontSize:26, lineHeight:1.1, color:atlasTokens.ink, marginBottom:10, fontWeight:500, letterSpacing:-0.2 }}>
          <span style={{ fontStyle:'italic' }}>{niche.name}</span> in {metro.name}
        </div>
        <div style={{ fontFamily:atlasTokens.sans, fontSize:12.5, lineHeight:1.6, color:atlasTokens.ink2, marginBottom:16, textWrap:'pretty' }}>
          Sweet-spot metro with underserved growth and high willingness-to-pay. Regional fit for {niche.name.toLowerCase()}, and live SERP shows beatable positions. Weighted score <span style={{ color:atlasTokens.accent, fontFamily:atlasTokens.mono, fontWeight:500 }}>{score.toFixed(1)}</span> — the strongest combination on the board.
        </div>
        <div style={{ display:'flex', gap:18, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${atlasTokens.rule}` }}>
          <AtlasMicroStat label="Growth"  v={`${metro.growth}/10`} c={atlasTokens.sweet} />
          <AtlasMicroStat label="Income"  v={`${metro.income}/10`} c={atlasTokens.sweet} />
          <AtlasMicroStat label="Rental"  v={niche.rental} />
          <AtlasMicroStat label="Pop."    v={`${(metro.pop/1000000).toFixed(1)}M`} />
        </div>
        <button onClick={onAnalyze} style={{
          width:'100%', padding:'11px 14px', borderRadius:6,
          background:atlasTokens.ink, color:atlasTokens.paper, border:'none', cursor:'pointer',
          fontFamily:atlasTokens.sans, fontSize:12.5, fontWeight:500, letterSpacing:0.2,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          Run deep analysis <span style={{ fontFamily:atlasTokens.mono, opacity:0.7 }}>→</span>
        </button>
      </div>

      {/* Runner-up picks */}
      {runnerUps.length > 0 && (
        <div style={{ background:atlasTokens.card, border:`1px solid ${atlasTokens.rule}`, borderRadius:10, padding:'14px 18px' }}>
          <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:10 }}>
            Also worth a look
          </div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {runnerUps.map((c, i) => (
              <button
                key={`${c.metro.id}-${c.niche.id}`}
                onClick={() => { onSelectMetro(c.metro.id); if (pickNiche) pickNiche(c.niche.id); }}
                style={{
                  display:'grid', gridTemplateColumns:'18px 1fr auto', alignItems:'baseline',
                  gap:9, padding:'10px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${atlasTokens.rule}`,
                  background:'transparent', border:'none',
                  borderTopStyle:'solid', borderTopWidth: i===0 ? 0 : 1, borderTopColor: i===0 ? 'transparent' : atlasTokens.rule,
                  cursor:'pointer', textAlign:'left',
                }}
              >
                <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.dim }}>{String(i+2).padStart(2,'0')}</span>
                <div>
                  <div style={{ fontFamily:atlasTokens.display, fontSize:14.5, color:atlasTokens.ink, lineHeight:1.2, fontWeight:500 }}>
                    <span style={{ fontStyle:'italic' }}>{c.niche.name}</span> · {c.metro.name}
                  </div>
                  <div style={{ fontFamily:atlasTokens.mono, fontSize:9.5, color:atlasTokens.muted, marginTop:3, letterSpacing:0.2 }}>
                    D{c.metro.growth} · P{c.metro.income} · {c.niche.rental}/mo
                  </div>
                </div>
                <div style={{ fontFamily:atlasTokens.display, fontSize:16, color:c.score>=7.5?atlasTokens.sweet:atlasTokens.comp, fontWeight:500 }}>
                  {c.score.toFixed(1)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function AtlasMicroStat({ label, v, c }) {
  return (
    <div>
      <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:3 }}>{label}</div>
      <div style={{ fontFamily:atlasTokens.mono, fontSize:13, color: c || atlasTokens.ink, fontWeight:500 }}>{v}</div>
    </div>
  );
}

// ─── Metro detail card ─────────────────────────────────────
function AtlasMetroDetail({ metro, onClear, onAnalyze, nicheSel, pickNiche, includeNiches = [], excludeNiches = [] }) {
  const q = window.MIutil.quadrant(metro.growth, metro.income);
  const qc = ATLAS_QUAD_COLORS[q.key];
  const [sortBy, setSortBy] = React.useState('score');
  const [catFilter, setCatFilter] = React.useState('all');

  const niches = React.useMemo(() => {
    let rows = window.NICHE_CATS.flatMap(cat => cat.niches.map(n => {
      const strong = window.MIutil.isStrong(n, metro) && metro.growth >= 6;
      const score = window.MIutil.comboScore(metro, n);
      const isInc = includeNiches.some(x => x.id === n.id);
      const isExc = excludeNiches.some(x => x.id === n.id);
      const isHighlight = (metro.highlights || []).some(h => n.name.toLowerCase().includes(h.toLowerCase()) || h.toLowerCase().includes(n.name.toLowerCase()));
      return { niche: n, cat, strong, score, isInc, isExc, isHighlight };
    }));
    if (catFilter !== 'all') rows = rows.filter(r => r.cat.id === catFilter);
    rows.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score || (b.strong?1:0) - (a.strong?1:0);
      if (sortBy === 'rental') {
        // Sort by the upper rental bound — parse "$500–900" → 900
        const parse = s => parseInt((s||'').split('–')[1] || s.match(/\d+/g)?.pop() || 0, 10);
        return parse(b.niche.rental) - parse(a.niche.rental);
      }
      if (sortBy === 'name') return a.niche.name.localeCompare(b.niche.name);
      if (sortBy === 'cat')  return a.cat.label.localeCompare(b.cat.label) || b.score - a.score;
      return 0;
    });
    return rows;
  }, [metro, sortBy, catFilter, includeNiches, excludeNiches]);

  const strongCount = niches.filter(n => n.strong).length;

  return (
    <div style={{ background:atlasTokens.cardHi, border:`1px solid ${atlasTokens.rule}`, borderRadius:10, overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'calc(100vh - 100px)' }}>
      {/* Header */}
      <div style={{ padding:'14px 18px 12px', borderBottom:`1px solid ${atlasTokens.rule}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:atlasTokens.mono, fontSize:9.5, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:4 }}>
            {metro.region} · pop. {(metro.pop||0)>=1000000?(metro.pop/1000000).toFixed(1)+'M':Math.round((metro.pop||0)/1000)+'k'}
          </div>
          <div style={{ fontFamily:atlasTokens.display, fontSize:22, color:atlasTokens.ink, lineHeight:1.1, fontWeight:500 }}>
            {metro.name}<span style={{ color:atlasTokens.dim, fontWeight:400 }}>, {metro.state}</span>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:8, padding:'3px 9px', borderRadius:14, background:`${qc}18`, border:`1px solid ${qc}55` }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:qc }} />
            <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:qc, letterSpacing:0.5 }}>{q.label}</span>
          </div>
        </div>
        <button onClick={onClear} style={{
          background:'transparent', border:`1px solid ${atlasTokens.rule}`,
          width:24, height:24, borderRadius:4, cursor:'pointer',
          fontFamily:atlasTokens.mono, fontSize:11, color:atlasTokens.muted,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>✕</button>
      </div>

      {/* Demand/Paying bars */}
      <div style={{ padding:'12px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, borderBottom:`1px solid ${atlasTokens.rule}`, flexShrink:0 }}>
        <AtlasBarStat label="Underserved growth" v={metro.growth} color={metro.growth>=7?atlasTokens.sweet:metro.growth>=5?atlasTokens.comp:atlasTokens.bad} />
        <AtlasBarStat label="Willingness to pay" v={metro.income} color={metro.income>=7?atlasTokens.sweet:metro.income>=5?atlasTokens.comp:atlasTokens.bad} />
      </div>

      {/* Niches toolbar */}
      <div style={{ padding:'12px 18px 8px', borderBottom:`1px solid ${atlasTokens.rule}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8 }}>
          <div>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:atlasTokens.dim }}>
              Service niches
            </div>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted, marginTop:2 }}>
              {strongCount} strong of {niches.length}
              {catFilter !== 'all' && (<span> · filtered</span>)}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontFamily:atlasTokens.mono, fontSize:9, color:atlasTokens.dim, letterSpacing:0.5, textTransform:'uppercase' }}>sort</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                background:atlasTokens.paper, border:`1px solid ${atlasTokens.rule}`, borderRadius:4,
                padding:'3px 6px', fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.ink2,
                cursor:'pointer',
              }}
            >
              <option value="score">Score</option>
              <option value="rental">Rental</option>
              <option value="name">Name</option>
              <option value="cat">Category</option>
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          <button
            onClick={() => setCatFilter('all')}
            style={{
              fontFamily:atlasTokens.mono, fontSize:9.5, padding:'3px 8px', borderRadius:10,
              background: catFilter==='all' ? atlasTokens.ink : 'transparent',
              border: `1px solid ${catFilter==='all' ? atlasTokens.ink : atlasTokens.rule}`,
              color: catFilter==='all' ? atlasTokens.paper : atlasTokens.muted,
              cursor:'pointer', letterSpacing:0.3,
            }}
          >All</button>
          {window.NICHE_CATS.map(c => {
            const isActive = catFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCatFilter(isActive ? 'all' : c.id)}
                style={{
                  fontFamily:atlasTokens.mono, fontSize:9.5, padding:'3px 8px', borderRadius:10,
                  background: isActive ? `${c.color}22` : 'transparent',
                  border: `1px solid ${isActive ? c.color + '77' : atlasTokens.rule}`,
                  color: isActive ? c.color : atlasTokens.muted,
                  cursor:'pointer', letterSpacing:0.3,
                  display:'inline-flex', alignItems:'center', gap:5,
                }}
              >
                <span style={{ width:5, height:5, borderRadius:1, background:c.color }} />
                {c.label.replace(' Services','').replace(' & Wellness','').replace(' & Financial','')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Niche list */}
      <div style={{ flex:1, overflow:'auto', minHeight:0 }}>
        {niches.map((row, i) => {
          const { niche: n, cat, strong, score, isInc, isExc, isHighlight } = row;
          const isSel = nicheSel === n.id;
          const scColor = score>=7.5 ? atlasTokens.sweet : score>=6 ? atlasTokens.comp : score>=4.5 ? atlasTokens.growth : atlasTokens.muted;
          return (
            <div
              key={n.id}
              onClick={() => pickNiche && pickNiche(n.id)}
              style={{
                position:'relative', padding:'10px 18px 10px 22px', cursor:'pointer',
                background: isSel ? `${atlasTokens.accent}10` : isExc ? `${atlasTokens.bad}06` : 'transparent',
                borderBottom: i === niches.length - 1 ? 'none' : `1px solid ${atlasTokens.rule}`,
                display:'flex', alignItems:'center', gap:12,
                opacity: isExc ? 0.55 : 1,
                transition:'background .12s',
              }}
              onMouseEnter={e => { if(!isSel && !isExc) e.currentTarget.style.background = `${atlasTokens.ink}04`; }}
              onMouseLeave={e => { if(!isSel && !isExc) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Category color stripe */}
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:cat.color, opacity: strong ? 1 : 0.35 }} />

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                  <span style={{
                    fontFamily:atlasTokens.sans, fontSize:13, color:atlasTokens.ink, fontWeight:500,
                    textDecoration: isExc ? 'line-through' : 'none',
                  }}>{n.name}</span>
                  {isInc && (
                    <span style={{ fontFamily:atlasTokens.mono, fontSize:9, padding:'1px 5px', borderRadius:3, background:`${atlasTokens.accent}1f`, color:atlasTokens.accent, fontWeight:600 }}>+</span>
                  )}
                  {isExc && (
                    <span style={{ fontFamily:atlasTokens.mono, fontSize:9, padding:'1px 5px', borderRadius:3, background:`${atlasTokens.bad}1f`, color:atlasTokens.bad, fontWeight:600 }}>−</span>
                  )}
                  {isHighlight && !isInc && !isExc && (
                    <span title="Featured in this metro" style={{ fontFamily:atlasTokens.mono, fontSize:9, color:atlasTokens.accent, letterSpacing:0.3 }}>★</span>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted }}>
                  <span>{cat.label.replace(' Services','').replace(' & Wellness','').replace(' & Financial','')}</span>
                  <span style={{ color:atlasTokens.dim }}>·</span>
                  <span style={{ color:atlasTokens.ink2, fontWeight:500 }}>${n.rental.replace('$','')}/mo</span>
                  <span style={{ color:atlasTokens.dim }}>·</span>
                  {strong
                    ? <span style={{ color:atlasTokens.sweet }}>● strong</span>
                    : <span style={{ color:atlasTokens.dim }}>○ wide</span>}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                <span style={{ fontFamily:atlasTokens.display, fontSize:18, color:scColor, fontWeight:500, lineHeight:1 }}>
                  {score.toFixed(1)}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onAnalyze(metro, n); }}
                  style={{
                    fontFamily:atlasTokens.mono, fontSize:9.5, padding:'2px 7px', borderRadius:3,
                    background:'transparent', border:`1px solid ${atlasTokens.rule}`,
                    color:atlasTokens.ink2, cursor:'pointer', letterSpacing:0.4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = atlasTokens.ink; e.currentTarget.style.color = atlasTokens.paper; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = atlasTokens.ink2; }}
                >analyze ▸</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function AtlasBarStat({ label, v, color }) {
  return (
    <div>
      <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:5 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:5 }}>
        <span style={{ fontFamily:atlasTokens.display, fontSize:24, color, lineHeight:1, fontWeight:500 }}>{v}</span>
        <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.dim }}>/10</span>
      </div>
      <div style={{ height:3, background:atlasTokens.rule, borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${v*10}%`, height:'100%', background:color }} />
      </div>
    </div>
  );
}

// ─── Ranked table — metro-level summary ────────────────────
function AtlasTable({ rows, selected, includeNiches = [], excludeNiches = [], quadrantFilters = {}, setSelected, onClearMetro, clearAllFilters, viewportActive=false, totalRows=0, limit = 60 }) {
  const [sortKey, setSortKey] = React.useState('score');
  const [sortDir, setSortDir] = React.useState('desc');
  const QUAD_RANK = { sweet: 4, growth: 3, comp: 2, watch: 1 };

  const sorted = React.useMemo(() => {
    const r = [...rows];
    r.sort((a,b) => {
      let av, bv;
      switch (sortKey) {
        case 'score':  av=a.score; bv=b.score; break;
        case 'metro':  av=a.metro.name; bv=b.metro.name; break;
        case 'growth': av=a.metro.growth; bv=b.metro.growth; break;
        case 'fit':    av=QUAD_RANK[a.q.key]; bv=QUAD_RANK[b.q.key]; break;
        default: av=a.score; bv=b.score;
      }
      if (typeof av === 'string') return sortDir==='asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir==='asc' ? av-bv : bv-av;
    });
    return r;
  }, [rows, sortKey, sortDir]);

  const onSort = k => {
    if (sortKey === k) setSortDir(d => d==='asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };
  const arrow = k => sortKey===k ? (sortDir==='asc'?'↑':'↓') : '';

  const Th = ({ k, children, w, align='left' }) => (
    <th onClick={() => onSort(k)} style={{
      textAlign:align, padding:'10px 16px', cursor:'pointer', userSelect:'none',
      fontFamily:atlasTokens.mono, fontSize:9.5, letterSpacing:1.8, textTransform:'uppercase',
      color: sortKey===k ? atlasTokens.ink : atlasTokens.muted, fontWeight:500,
      borderBottom:`1px solid ${atlasTokens.ruleHi}`, position:'sticky', top:0,
      background:atlasTokens.cardHi, whiteSpace:'nowrap', width:w,
    }}>
      {children} <span style={{ color:atlasTokens.accent, marginLeft:2 }}>{arrow(k)}</span>
    </th>
  );

  const activeQuads = Object.keys(quadrantFilters).filter(k => quadrantFilters[k]);
  const QUAD_LABELS = { sweet:'Prime Market', growth:'Growth Market', comp:'Competitive', watch:'Watch List' };

  return (
    <div style={{ background:atlasTokens.cardHi, border:`1px solid ${atlasTokens.rule}`, borderRadius:10, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:0 }}>
      <div style={{ padding:'12px 18px', borderBottom:`1px solid ${atlasTokens.rule}`, display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:atlasTokens.display, fontSize:17, color:atlasTokens.ink, lineHeight:1.1, fontWeight:500 }}>
            Opportunity rankings
          </div>
          <div style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted, marginTop:3 }}>
            {sorted.length} of {(window.METROS||[]).length+(window.CITIES||[]).length} locations
            {selected && (<span> · <span style={{ color:atlasTokens.ink2 }}>{(window.METROS.find(m=>m.id===selected)||(window.CITIES||[]).find(c=>c.id===selected))?.name} selected</span></span>)}
            {activeQuads.length > 0 && (<span> · <span style={{ color:atlasTokens.ink2 }}>{activeQuads.length} quadrant{activeQuads.length>1?'s':''}</span></span>)}
            {includeNiches.length > 0 && (<span> · <span style={{ color:atlasTokens.accent }}>+{includeNiches.length} include</span></span>)}
            {excludeNiches.length > 0 && (<span> · <span style={{ color:atlasTokens.bad }}>−{excludeNiches.length} exclude</span></span>)}
          </div>
        </div>
        <div style={{ flex:1 }} />
        {(selected || includeNiches.length > 0 || excludeNiches.length > 0 || activeQuads.length > 0) && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end', maxWidth:'62%' }}>
            {selected && (
              <button onClick={onClearMetro} style={{
                fontFamily:atlasTokens.mono, fontSize:10, padding:'4px 9px', borderRadius:11,
                background:`${atlasTokens.ink}0c`, border:`1px solid ${atlasTokens.rule}`,
                color:atlasTokens.ink2, cursor:'pointer',
              }}>{(window.METROS.find(m=>m.id===selected)||(window.CITIES||[]).find(c=>c.id===selected))?.name} ✕</button>
            )}
            {activeQuads.map(k => {
              const c = atlasTokens[k];
              return (
                <span key={'q-'+k} style={{
                  fontFamily:atlasTokens.mono, fontSize:10, padding:'4px 9px', borderRadius:11,
                  background:`${c}1a`, border:`1px solid ${c}55`,
                  color:c, display:'inline-flex', alignItems:'center', gap:5,
                }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:c }} />
                  {QUAD_LABELS[k]}
                </span>
              );
            })}
            {includeNiches.slice(0, 3).map(n => (
              <span key={'inc-'+n.id} style={{
                fontFamily:atlasTokens.mono, fontSize:10, padding:'4px 9px', borderRadius:11,
                background:`${n.cat.color}18`, border:`1px solid ${n.cat.color}55`,
                color:n.cat.color,
              }}>+ {n.name}</span>
            ))}
            {includeNiches.length > 3 && (
              <span style={{ fontFamily:atlasTokens.mono, fontSize:10, padding:'4px 9px', borderRadius:11, background:atlasTokens.card, border:`1px solid ${atlasTokens.rule}`, color:atlasTokens.muted }}>
                +{includeNiches.length - 3} more
              </span>
            )}
            {excludeNiches.slice(0, 2).map(n => (
              <span key={'exc-'+n.id} style={{
                fontFamily:atlasTokens.mono, fontSize:10, padding:'4px 9px', borderRadius:11,
                background:`${atlasTokens.bad}10`, border:`1px solid ${atlasTokens.bad}44`,
                color:atlasTokens.bad, textDecoration:'line-through',
              }}>− {n.name}</span>
            ))}
            {(includeNiches.length + excludeNiches.length + activeQuads.length) > 0 && clearAllFilters && (
              <button onClick={clearAllFilters} style={{
                fontFamily:atlasTokens.mono, fontSize:10, padding:'4px 9px', borderRadius:11,
                background:'transparent', border:`1px solid ${atlasTokens.rule}`,
                color:atlasTokens.muted, cursor:'pointer',
              }}>clear filters</button>
            )}
          </div>
        )}
      </div>

      <div style={{ overflow:'auto', flex:1, minHeight:0 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <Th k="score" w={56}>#</Th>
              <Th k="metro">Metro</Th>
              <Th k="growth" w={96} align="right">Demand</Th>
              <Th k="fit" w={140}>Fit</Th>
              <Th k="score" w={120} align="right">Score</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, limit).map((r, i) => {
              const qc = ATLAS_QUAD_COLORS[r.q.key];
              const isSel = r.metro.id === selected;
              const scColor = r.score>=7.5?atlasTokens.sweet:r.score>=6?atlasTokens.comp:r.score>=4.5?atlasTokens.growth:atlasTokens.muted;
              const dColor = r.metro.growth>=7?atlasTokens.sweet:r.metro.growth>=5?atlasTokens.ink2:atlasTokens.muted;
              return (
                <tr key={r.metro.id}
                    id={`tbl-row-${r.metro.id}`}
                    onClick={() => setSelected(r.metro.id)}
                    style={{
                      cursor:'pointer',
                      background: isSel ? `${atlasTokens.accent}0d` : 'transparent',
                      borderBottom:`1px solid ${atlasTokens.rule}`,
                    }}
                    onMouseEnter={e => { if(!isSel) e.currentTarget.style.background = `${atlasTokens.ink}05`; }}
                    onMouseLeave={e => { if(!isSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding:'10px 16px', fontFamily:atlasTokens.mono, fontSize:11, color:atlasTokens.muted }}>{String(i+1).padStart(2,'0')}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <span style={{ width:7, height:7, borderRadius:'50%', background:qc, flexShrink:0 }} />
                      <span style={{ fontFamily:atlasTokens.display, fontSize:15, color:atlasTokens.ink, fontWeight:500 }}>{r.metro.name}</span>
                      <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.dim }}>{r.metro.state}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px', textAlign:'right' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:7, justifyContent:'flex-end' }}>
                      <div style={{ width:40, height:3, background:atlasTokens.rule, borderRadius:2, overflow:'hidden' }}>
                        <div style={{ width:`${r.metro.growth*10}%`, height:'100%', background:dColor }} />
                      </div>
                      <span style={{ fontFamily:atlasTokens.mono, fontSize:12, color:dColor, width:14, textAlign:'right' }}>{r.metro.growth}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{
                      fontFamily:atlasTokens.mono, fontSize:10, padding:'3px 9px', borderRadius:10,
                      background:`${qc}18`, border:`1px solid ${qc}55`, color:qc,
                      display:'inline-flex', alignItems:'center', gap:5,
                      letterSpacing:0.3,
                    }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:qc }} />
                      {r.q.label}
                    </span>
                  </td>
                  <td style={{ padding:'10px 16px', textAlign:'right' }}>
                    <div style={{ display:'inline-flex', alignItems:'baseline', gap:6, justifyContent:'flex-end' }}>
                      <span style={{ fontFamily:atlasTokens.display, fontSize:18, color:scColor, fontWeight:500, lineHeight:1 }}>
                        {r.score.toFixed(1)}
                      </span>
                      <span style={{ fontFamily:atlasTokens.mono, fontSize:9.5, color:atlasTokens.dim }}>/10</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Analysis modal (paper card overlay) ──────────────────
function AtlasAnalysisModal({ analysis, onClose }) {
  if (!analysis) return null;
  const a = analysis;
  const decConfig = {
    strong_go:      { label:'Strong go',      color:atlasTokens.sweet,  bg:`${atlasTokens.sweet}14` },
    conditional_go: { label:'Conditional go', color:atlasTokens.growth, bg:`${atlasTokens.growth}14` },
    hold:           { label:'Hold',           color:atlasTokens.comp,   bg:`${atlasTokens.comp}18` },
    no_go:          { label:'No go',          color:atlasTokens.bad,    bg:`${atlasTokens.bad}14` },
  }[a.decision];
  return (
    <div style={{ position:'absolute', inset:0, background:'rgba(26,29,35,0.42)', backdropFilter:'blur(2px)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'40px 32px', zIndex:2000, overflow:'auto' }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background:atlasTokens.paper, border:`1px solid ${atlasTokens.ruleHi}`, borderRadius:12,
        id:'atlas-analysis-content', width:'94%', maxWidth:920, boxShadow:'0 20px 60px rgba(26,29,35,0.25)',
      }}>
        {/* Header */}
        <div style={{ padding:'24px 32px 18px', borderBottom:`1px solid ${atlasTokens.rule}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:9.5, letterSpacing:2, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:6 }}>
              Deep market analysis · {a.metro.name}, {a.metro.state}
            </div>
            <div style={{ fontFamily:atlasTokens.display, fontSize:32, color:atlasTokens.ink, lineHeight:1.05, fontWeight:500, marginBottom:10 }}>
              <span style={{ fontStyle:'italic' }}>{a.niche.name}</span> · {a.metro.name}
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 11px', borderRadius:14, background:decConfig.bg, border:`1px solid ${decConfig.color}55` }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:decConfig.color }} />
              <span style={{ fontFamily:atlasTokens.mono, fontSize:11, color:decConfig.color, letterSpacing:0.5, fontWeight:500 }}>{decConfig.label}</span>
            </div>
            <div style={{ marginTop:10, fontFamily:atlasTokens.mono, fontSize:11, color:atlasTokens.muted }}>
              Target query: <span style={{ color:atlasTokens.ink2 }}>"{a.primary_query}"</span>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:4 }}>Weighted score</div>
            <div style={{ fontFamily:atlasTokens.display, fontSize:54, lineHeight:0.95, color:decConfig.color, fontWeight:500 }}>{a.wt}</div>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted }}>/ 10.00</div>
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button onClick={onClose} style={{
                fontFamily:atlasTokens.mono, fontSize:10, padding:'5px 10px',
                background:'transparent', border:`1px solid ${atlasTokens.rule}`, borderRadius:4,
                color:atlasTokens.muted, cursor:'pointer',
              }}>✕ close</button>
              <button onClick={() => {
                const el = document.getElementById('atlas-analysis-content');
                if (!el) return;
                if (window.html2pdf) {
                  const metro = a.geo || 'market';
                  const niche = a.niche || 'analysis';
                  window.html2pdf().set({
                    margin:10, filename:`${metro}-${niche}.pdf`.toLowerCase().replace(/[^a-z0-9-]/g,'-'),
                    html2canvas:{ scale:2, backgroundColor: '#fff' },
                    jsPDF:{ unit:'mm', format:'a4', orientation:'portrait' },
                  }).from(el).save();
                } else {
                  window.print();
                }
              }} style={{
                fontFamily:atlasTokens.mono, fontSize:10, padding:'5px 10px',
                background:'transparent', border:`1px solid ${atlasTokens.rule}`, borderRadius:4,
                color:atlasTokens.muted, cursor:'pointer',
              }}>⬇ PDF</button>
            </div>
          </div>
        </div>

        {/* Signals row */}
        <div style={{ padding:'18px 32px', borderBottom:`1px solid ${atlasTokens.rule}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:atlasTokens.sweet, marginBottom:5 }}>▲ Strongest signal</div>
            <div style={{ fontFamily:atlasTokens.sans, fontSize:13, color:atlasTokens.ink, lineHeight:1.5 }}>{a.strongest_signal}</div>
          </div>
          <div>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:atlasTokens.bad, marginBottom:5 }}>▼ Biggest risk</div>
            <div style={{ fontFamily:atlasTokens.sans, fontSize:13, color:atlasTokens.ink, lineHeight:1.5 }}>{a.biggest_risk}</div>
          </div>
        </div>

        {/* Four phases */}
        <div style={{ padding:'18px 32px', borderBottom:`1px solid ${atlasTokens.rule}` }}>
          <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:10 }}>Four-phase breakdown</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
            <AtlasPhase label="Geo"          weight="20%" score={a.phases.geo}    details={[['Median income', a.median_income],['Migration', a.migration]]} />
            <AtlasPhase label="Growth"       weight="30%" score={a.phases.growth} details={[['Volume', `${a.volume.toLocaleString()}/mo`, true],['KD', `${a.kd}/100`, true],['CPC', `$${a.cpc}`, true]]} />
            <AtlasPhase label="Competition"  weight="25%" score={a.phases.comp}   details={[['LTV', a.ltv],['Rental', `${a.rental}/mo`],['Receptivity', a.receptivity]]} />
            <AtlasPhase label="Opportunity"  weight="25%" score={a.phases.opp}    details={[['SERP avg DR', `${a.avg_dr}`, true],['Beatable', `${a.beatable} of 10`, true],['Rank time', a.rank_time]]} />
          </div>
        </div>

        {/* SERP table */}
        <div style={{ padding:'18px 32px', borderBottom:`1px solid ${atlasTokens.rule}` }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.dim }}>SERP top 10 · live data</div>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted }}>
              {a.serp.filter(s=>s.type==='aggregator').length} aggregators · {a.serp.filter(s=>s.type==='beatable').length} beatable · {a.serp.filter(s=>s.type==='rank-rent').length} rank-rent
            </div>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>
              {a.serp.map(s => {
                const c = s.type==='aggregator' ? atlasTokens.bad : s.type==='beatable' ? atlasTokens.sweet : atlasTokens.comp;
                return (
                  <tr key={s.pos} style={{ borderBottom:`1px solid ${atlasTokens.rule}` }}>
                    <td style={{ padding:'6px 0', width:24, fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.dim }}>{s.pos}</td>
                    <td style={{ padding:'6px 10px', fontFamily:atlasTokens.sans, fontSize:12, color:atlasTokens.ink }}>{s.domain}</td>
                    <td style={{ padding:'6px 0', width:120 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ flex:1, height:3, background:atlasTokens.rule, borderRadius:2, overflow:'hidden' }}>
                          <div style={{ width:`${s.dr}%`, height:'100%', background: s.dr>=60?atlasTokens.bad:s.dr>=35?atlasTokens.comp:atlasTokens.sweet }} />
                        </div>
                        <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted, width:20, textAlign:'right' }}>{s.dr}</span>
                      </div>
                    </td>
                    <td style={{ padding:'6px 10px', width:100, fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted, textAlign:'right' }}>{s.backlinks.toLocaleString()} bl</td>
                    <td style={{ padding:'6px 0', width:90, textAlign:'right' }}>
                      <span style={{ fontFamily:atlasTokens.mono, fontSize:9.5, color:c, letterSpacing:0.5 }}>
                        {s.type==='aggregator' ? '◆ aggregator' : s.type==='beatable' ? '○ beatable' : '◇ rank-rent?'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Executive summary */}
        <div style={{ padding:'18px 32px', borderBottom:`1px solid ${atlasTokens.rule}` }}>
          <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:10 }}>Executive summary</div>
          <div style={{ fontFamily:atlasTokens.display, fontSize:16, lineHeight:1.65, color:atlasTokens.ink2, textWrap:'pretty' }}>{a.summary}</div>
        </div>

        {/* Recommended next move */}
        <div style={{ padding:'18px 32px 24px' }}>
          <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.accent, marginBottom:8 }}>→ Recommended first move</div>
          <div style={{ fontFamily:atlasTokens.sans, fontSize:14, color:atlasTokens.ink, lineHeight:1.55 }}>{a.first_action}</div>
        </div>
      </div>
    </div>
  );
}

function AtlasPhase({ label, weight, score, details }) {
  const c = score>=7 ? atlasTokens.sweet : score>=5 ? atlasTokens.comp : atlasTokens.bad;
  return (
    <div style={{ background:atlasTokens.cardHi, border:`1px solid ${atlasTokens.rule}`, borderRadius:8, padding:'12px 14px' }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:atlasTokens.muted }}>{label}</span>
        <span style={{ fontFamily:atlasTokens.mono, fontSize:9, color:atlasTokens.dim }}>{weight}</span>
      </div>
      <div style={{ fontFamily:atlasTokens.display, fontSize:26, color:c, lineHeight:1, fontWeight:500, marginBottom:8 }}>
        {score}<span style={{ fontFamily:atlasTokens.mono, fontSize:11, color:atlasTokens.dim, fontWeight:400 }}>/10</span>
      </div>
      <div style={{ height:3, background:atlasTokens.rule, borderRadius:2, overflow:'hidden', marginBottom:10 }}>
        <div style={{ width:`${score*10}%`, height:'100%', background:c }} />
      </div>
      {details.map(([k, v, live]) => (
        <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0', fontFamily:atlasTokens.mono, fontSize:10 }}>
          <span style={{ color:atlasTokens.dim }}>{k}</span>
          <span style={{ color:atlasTokens.ink2, display:'flex', alignItems:'center', gap:5 }}>
            {v}
            {live ? <span style={{ width:4, height:4, borderRadius:'50%', background:atlasTokens.accent }} title="Live data" />
                  : <span style={{ width:4, height:4, borderRadius:'50%', background:atlasTokens.rule }} title="AI estimate" />}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Top bar ───────────────────────────────────────────────
function AtlasTopBar({ status, onPulse, onGap }) {
  const s = status || {};
  const pill = (ok, label) => (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background: ok === true ? atlasTokens.sweet : ok === false ? atlasTokens.bad : atlasTokens.dim }} />
      <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted, letterSpacing:0.5 }}>{label}</span>
    </div>
  );
  return (
    <div style={{
      padding:'14px 24px', borderBottom:`1px solid ${atlasTokens.rule}`,
      background:atlasTokens.paper, display:'flex', alignItems:'center', gap:18, flexShrink:0,
    }}>
      <div>
        <div style={{ fontFamily:atlasTokens.display, fontSize:18, color:atlasTokens.ink, lineHeight:1, fontWeight:500 }}>
          Market <span style={{ fontStyle:'italic', color:atlasTokens.ink2 }}>Intelligence</span>
        </div>
        <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:2.2, textTransform:'uppercase', color:atlasTokens.dim, marginTop:3 }}>
          {((window.METROS||[]).length + (window.CITIES||[]).length).toLocaleString()} cities · {(window.NICHE_CATS||[]).flatMap(c=>c.niches).length} services
        </div>
      </div>
      <div style={{ flex:1 }} />
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        {pill(s.anthropic, 'Claude')}
        {pill(s.dataforseo, 'DataForSEO')}
      <div style={{ flex:1 }}/>
      <button onClick={onPulse} style={{
        padding:'6px 14px', borderRadius:6, border:`1px solid ${atlasTokens.ruleHi}`,
        background: atlasTokens.cardHi, color: atlasTokens.ink2,
        fontFamily: atlasTokens.mono, fontSize:11, cursor:'pointer',
        letterSpacing:'0.04em', fontWeight:500,
        transition:'background .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = atlasTokens.card}
        onMouseLeave={e => e.currentTarget.style.background = atlasTokens.cardHi}>
        ⬡ Market Pulse
      </button>
      <button onClick={onGap} style={{
        padding:'6px 14px', borderRadius:6, border:`1px solid ${atlasTokens.ruleHi}`,
        background: atlasTokens.cardHi, color: atlasTokens.ink2,
        fontFamily: atlasTokens.mono, fontSize:11, cursor:'pointer',
        letterSpacing:'0.04em', fontWeight:500, transition:'background .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = atlasTokens.card}
        onMouseLeave={e => e.currentTarget.style.background = atlasTokens.cardHi}>
        ◈ Gap Finder
      </button>
        <div style={{ width:1, height:18, background:atlasTokens.rule }} />
        <div style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.dim, letterSpacing:0.5 }}>
          {s.checked ? 'connected' : 'checking…'}
        </div>
      </div>
    </div>
  );
}

// ─── Loading overlay shown while a deep analysis "runs" ────
const ATLAS_LOAD_PHASES = [
  'Reading geo demographics…',
  'Pulling live search-volume from DataForSEO…',
  'Scanning competitor density and ad-spend signals…',
  'Auditing SERP top-10 for beatable positions…',
  'Calculating weighted four-phase score…',
  'Writing executive brief…',
];
function AtlasAnalysisLoader({ metro, niche, onCancel, error }) {
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    if (error) return;
    const t = setInterval(() => setPhase(p => Math.min(p + 1, ATLAS_LOAD_PHASES.length - 1)), 900);
    return () => clearInterval(t);
  }, [error]);
  return (
    <div style={{ position:'absolute', inset:0, background:`${atlasTokens.paper}d0`, backdropFilter:'blur(2px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1900 }}>
      <div style={{
        background:atlasTokens.card, border:`1px solid ${atlasTokens.ruleHi}`, borderRadius:12,
        padding:'28px 36px', minWidth:420, maxWidth:520, boxShadow:'0 20px 60px rgba(26,29,35,0.15)',
      }}>
        <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:2, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:6 }}>
          {error ? 'Analysis failed' : 'Running deep analysis'}
        </div>
        <div style={{ fontFamily:atlasTokens.display, fontSize:22, color:atlasTokens.ink, lineHeight:1.15, fontWeight:500, marginBottom:18 }}>
          <span style={{ fontStyle:'italic' }}>{niche.name}</span> · {metro.name}, {metro.state}
        </div>
        {error ? (
          <div style={{
            padding:'12px 14px', borderRadius:6,
            background:`${atlasTokens.bad}10`, border:`1px solid ${atlasTokens.bad}44`,
            fontFamily:atlasTokens.mono, fontSize:11.5, color:atlasTokens.bad, lineHeight:1.5,
            marginBottom:14,
          }}>{error}</div>
        ) : (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:18 }}>
              {ATLAS_LOAD_PHASES.map((p, i) => {
                const state = i < phase ? 'done' : i === phase ? 'active' : 'pending';
                return (
                  <div key={p} style={{ display:'flex', alignItems:'center', gap:10, opacity: state==='pending' ? 0.3 : 1 }}>
                    <span style={{
                      width:6, height:6, borderRadius:'50%',
                      background: state==='done' ? atlasTokens.accent : state==='active' ? atlasTokens.accent : atlasTokens.rule,
                      boxShadow: state==='active' ? `0 0 0 4px ${atlasTokens.accent}33` : 'none',
                      transition:'all .2s',
                    }} />
                    <span style={{ fontFamily:atlasTokens.mono, fontSize:11, color: state==='active' ? atlasTokens.ink : atlasTokens.muted }}>
                      {p}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ height:2, background:atlasTokens.rule, borderRadius:1, overflow:'hidden', marginBottom:16 }}>
              <div style={{
                width:`${((phase+1) / ATLAS_LOAD_PHASES.length) * 100}%`, height:'100%',
                background:atlasTokens.accent, transition:'width .35s ease',
              }} />
            </div>
          </>
        )}
        <button onClick={onCancel} style={{
          background:'transparent', border:`1px solid ${atlasTokens.rule}`, borderRadius:5,
          padding:'5px 12px', fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted, cursor:'pointer',
        }}>{error ? 'Close' : 'Cancel'}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LIVE ANALYSIS — Claude + DataForSEO
// ═══════════════════════════════════════════════════════════

const AGGREGATOR_DOMAINS = [
  'yelp.com','angi.com','angieslist.com','homeadvisor.com','thumbtack.com',
  'houzz.com','porch.com','bbb.org','yellowpages.com','bark.com','expertise.com',
  'manta.com','superpages.com','mapquest.com','facebook.com','nextdoor.com',
];
const RANK_RENT_HINTS = ['rankings','reviews','best','top','compare','local','near'];

function isAggregator(url='') { return AGGREGATOR_DOMAINS.some(d => url.includes(d)); }
function isRankRent(url='', dr=0) {
  const u = String(url).toLowerCase();
  return dr < 35 && !isAggregator(url) && RANK_RENT_HINTS.some(s => u.includes(s));
}

function extractBalancedJSON(text) {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{') depth++;
    if (c === '}') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

async function fetchDFS(metro, niche) {
  // kwGeo: clean ASCII for keyword volume queries (no en-dashes, no compound names)
  const kwGeo  = window.MIutil.kwName(metro).toLowerCase();
  // serpGeo: natural name for SERP queries (Google handles it fine)
  const serpGeo = `${metro.name}, ${metro.state}`.toLowerCase();
  const n = niche.name.toLowerCase();
  const primary   = `best ${n} in ${kwGeo}`;
  const serpPrimary = `best ${n} in ${serpGeo}`;
  const queries = [primary, `top ${n} ${kwGeo}`, `${n} near ${kwGeo}`, `affordable ${n} ${kwGeo}`];
  const [kwRes, serpRes] = await Promise.all([
    fetch(`/api/dfs/keywords?keywords=${encodeURIComponent(queries.join(','))}`).then(r => r.json()).catch(() => null),
    fetch(`/api/dfs/serp?keyword=${encodeURIComponent(serpPrimary)}`).then(r => r.json()).catch(() => null),
  ]);
  return { kwRes, serpRes, queries, primary, geo };
}

function buildPrompt(metro, niche, dfs) {
  const geo = `${metro.name}, ${metro.state}`;
  const dfsCtx = (() => {
    if (!dfs || (!dfs.kwRes?.keywords && !dfs.serpRes?.positions)) return 'No live DataForSEO data available — use your best estimates and mark each estimated field clearly.';
    let s = 'Live DataForSEO data follows — use these exact numbers in your scoring:\n';
    if (dfs.kwRes?.keywords?.length) {
      s += '\nKEYWORD VOLUME / COMPETITION:\n';
      dfs.kwRes.keywords.forEach((kw, i) => {
        s += `- "${dfs.queries[i]}": volume=${(kw.volume || 0).toLocaleString()}/mo, competition_index=${kw.competition_index ?? '?'}, cpc=$${kw.cpc ?? '?'}\n`;
      });
    }
    if (dfs.serpRes?.positions?.length) {
      s += `\nSERP TOP-10 for "${dfs.primary}":\n`;
      dfs.serpRes.positions.forEach(p => {
        s += `- #${p.position}: ${p.url} | DR=${p.domain_rank || 0} | backlinks=${(p.backlinks || 0).toLocaleString()}\n`;
      });
    }
    return s;
  })();

  return `You are a senior market analyst for a rank-and-rent lead generation business. You rank niche local websites for queries like "best ${niche.name.toLowerCase()} in ${geo.toLowerCase()}" and forward leads to local businesses via tracked phone numbers.

ANALYZE: geo="${geo}" niche="${niche.name}" metro_population=${metro.pop} demand_signal=${metro.growth}/10 paying_signal=${metro.income}/10 region="${metro.region}" suggested_rental="${niche.rental}/mo"

${dfsCtx}

Return ONLY a JSON object with this EXACT shape, no prose, no markdown:

{
  "primary_query": "best ${niche.name.toLowerCase()} in ${geo.toLowerCase()}",
  "phases": { "geo": 0, "growth": 0, "comp": 0, "opp": 0 },
  "volume": 0,
  "kd": 0,
  "cpc": "0.00",
  "seasonal": false,
  "median_income": "$0k",
  "migration": "+0.0% YoY",
  "serp_strength": "Weak|Medium|Strong",
  "avg_dr": 0,
  "aggregators": 0,
  "beatable": 0,
  "rank_rent_detected": false,
  "rank_time": "0 mo",
  "ltv": "$0.0k",
  "receptivity": "Low|Medium|High",
  "summary": "4-6 sentences. Tight analyst voice. Concrete, no hedging.",
  "strongest_signal": "One sentence — the single most actionable positive signal.",
  "biggest_risk": "One sentence — the single most concrete risk.",
  "first_action": "One sentence — the most useful first move this week."
}

Rules:
- All phase scores are integers 1-10. geo=demographics/economic fit. growth=search volume + intent. comp=local business density + willingness to pay for leads. opp=SERP beatability + speed-to-rank.
- volume = estimated monthly searches for primary_query (integer)
- kd = keyword difficulty 0-100 (integer)
- cpc = average CPC dollars as string with 2 decimals
- avg_dr = average Domain Rank of SERP top-10 (integer)
- aggregators = count of SERP top-10 that are aggregator/directory sites
- beatable = count of SERP top-10 with DR<30 (integer)
- rank_time format: "N mo" (e.g. "4 mo")
- ltv format: "$N.Nk" (e.g. "$5.2k")
- Voice: analyst, declarative, no marketing language, no "explore", no "consider". State conclusions.

Return ONLY the JSON object. Begin with {`;
}

function decideFromScore(wt) {
  if (wt >= 8) return 'strong_go';
  if (wt >= 6) return 'conditional_go';
  if (wt >= 4) return 'hold';
  return 'no_go';
}

function classifySerpType(url, dr) {
  if (isAggregator(url)) return 'aggregator';
  if (isRankRent(url, dr)) return 'rank-rent';
  if (dr < 30) return 'beatable';
  return 'beatable';
}

// Build the full analysis object expected by the modal.
async function runDeepAnalysis(metro, niche) {
  let dfs = null;
  try { dfs = await fetchDFS(metro, niche); } catch { /* DFS optional */ }

  const prompt = buildPrompt(metro, niche, dfs);
  const aRes = await fetch('/api/anthropic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!aRes.ok) {
    const t = await aRes.text().catch(() => '');
    throw new Error(`Anthropic ${aRes.status}: ${t.slice(0, 200) || 'no body'}`);
  }
  const aJson = await aRes.json();
  if (aJson.error) throw new Error(aJson.error.message || 'Anthropic error');
  const raw = aJson.content?.[0]?.text || '';
  const balanced = extractBalancedJSON(raw);
  if (!balanced) throw new Error('Could not extract JSON from Claude response.');
  let parsed;
  try { parsed = JSON.parse(balanced); }
  catch (e) { throw new Error('Invalid JSON in Claude response.'); }

  const W = { geo: 0.20, growth: 0.30, comp: 0.25, opp: 0.25 };
  const wt = (
    (parsed.phases?.geo    || 0) * W.geo +
    (parsed.phases?.growth || 0) * W.growth +
    (parsed.phases?.comp   || 0) * W.comp +
    (parsed.phases?.opp    || 0) * W.opp
  ).toFixed(2);

  // Build SERP rows: prefer live DFS, fall back to a small synthesized set for the modal.
  let serp;
  if (dfs?.serpRes?.positions?.length) {
    serp = dfs.serpRes.positions.slice(0, 10).map(p => ({
      pos: p.position,
      domain: (p.url || '').replace(/https?:\/\//, '').split('/')[0],
      dr: p.domain_rank || 0,
      backlinks: p.backlinks || 0,
      type: classifySerpType(p.url || '', p.domain_rank || 0),
    }));
  } else {
    // Synthesize from Claude's avg_dr / aggregators / beatable counts.
    serp = [];
    const avg = parsed.avg_dr || 40, agg = parsed.aggregators || 4, beat = parsed.beatable || 3;
    for (let i = 0; i < 10; i++) {
      const isAgg = i < agg;
      const isBeat = !isAgg && i < agg + beat;
      serp.push({
        pos: i + 1,
        domain: isAgg ? AGGREGATOR_DOMAINS[i % AGGREGATOR_DOMAINS.length] : `${niche.id}-${metro.id}${isBeat?'-pros':'-local'}.com`,
        dr: isAgg ? 75 + (i*3) : isBeat ? 14 + i*2 : 28 + i,
        backlinks: isAgg ? 1000000 + i * 200000 : isBeat ? 80 + i * 20 : 200 + i * 50,
        type: isAgg ? 'aggregator' : isBeat ? 'beatable' : 'rank-rent',
      });
    }
  }

  // Build queries table: prefer live, otherwise echo Claude's primary at estimated volume.
  let queries;
  if (dfs?.kwRes?.keywords?.length) {
    queries = dfs.kwRes.keywords.map((kw, i) => ({
      q: dfs.queries[i], vol: kw.volume || 0, kd: kw.competition_index || 0, cpc: kw.cpc || 0, src: 'live',
    }));
  } else {
    queries = [
      { q: parsed.primary_query, vol: parsed.volume || 0, kd: parsed.kd || 0, cpc: parseFloat(parsed.cpc) || 0, src: 'estimate' },
    ];
  }

  return {
    metro, niche,
    primary_query: parsed.primary_query,
    phases: parsed.phases,
    wt,
    decision: decideFromScore(parseFloat(wt)),
    volume: parsed.volume,
    kd: parsed.kd,
    cpc: parsed.cpc,
    seasonal: parsed.seasonal,
    median_income: parsed.median_income,
    migration: parsed.migration,
    serp_strength: parsed.serp_strength,
    avg_dr: parsed.avg_dr,
    aggregators: parsed.aggregators,
    beatable: parsed.beatable,
    rank_rent_detected: parsed.rank_rent_detected,
    rank_time: parsed.rank_time,
    rental: niche.rental,
    ltv: parsed.ltv,
    receptivity: parsed.receptivity,
    summary: parsed.summary,
    strongest_signal: parsed.strongest_signal,
    biggest_risk: parsed.biggest_risk,
    first_action: parsed.first_action,
    queries, serp,
    _live: !!dfs,
  };
}

// ─── Tweaks default state — persisted between markers ─────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "sage",
  "paperTone": "cream",
  "density": "regular",
  "tableLimit": 60
}/*EDITMODE-END*/;

// ─── Main Atlas app (standalone, full viewport) ───────────
function AtlasApp() {
  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider } = window;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // Rebuild tokens on every render so any tweak change applies live.
  atlasTokens = makeAtlasTokens(t);

  const [selected,     setSelected]    = React.useState(null);
  const [minPopFilter, setMinPopFilter] = React.useState(50000);     // population slider
  const [maxPopFilter, setMaxPopFilter] = React.useState(20000000);   // population slider max
  const [viewportIds,  setViewportIds]  = React.useState(null);     // null = no filter
  const [dataFreshness,setDataFreshness]= React.useState(null);     // Census last-updated
  const [enriching,    setEnriching]    = React.useState(false);





  // ── Scroll table + fly map to selected city/metro ───────────────────
  React.useEffect(() => {
    if (!selected) return;
    // Scroll table row into view
    const timer = setTimeout(() => {
      const row = document.getElementById(`tbl-row-${selected}`);
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
    // Fly map to the selected location
    const entity = (window.METROS||[]).find(m => m.id === selected)
                || (window.CITIES||[]).find(c => c.id === selected);
    if (entity?.lat && entity?.lng && typeof window._atlasFlyTo === 'function') {
      window._atlasFlyTo(entity.lat, entity.lng, 11);
    }
    return () => clearTimeout(timer);
  }, [selected]);

  // ── Unified filter → map sync ─────────────────────────────────────────
  // Single source of truth: whenever any filter changes, update the map.
  React.useEffect(() => {
    if (typeof window._applyMapFilters !== 'function') return;
    const nicheAll = window.MIutil ? window.MIutil.niches() : [];
    window._applyMapFilters({
      minPop         : minPopFilter,
      maxPop         : maxPopFilter,
      quadrantFilters: quadrantFilters,
      nicheFilters   : nicheFilters,
      nicheAll       : nicheAll,
    });
  }, [minPopFilter, maxPopFilter, quadrantFilters, nicheFilters]);

  // Load saved Census timestamp
  React.useEffect(() => {
    const saved = localStorage.getItem('atlas_census_ts');
    if (saved) setDataFreshness(saved);
  }, []);
  const [showPulse,  setShowPulse]  = React.useState(false);
  const [showGap,    setShowGap]    = React.useState(false);
  const [nicheFilters, setNicheFilters] = React.useState({}); // { [nicheId]: 'include' | 'exclude' }
  const [quadrantFilters, setQuadrantFilters] = React.useState({}); // { [key]: true }
  const [nicheSel, setNicheSel] = React.useState(null);
  const [analysis, setAnalysis] = React.useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = React.useState(null); // {metro, niche, error?}
  const [status, setStatus] = React.useState({ checked: false });
  const mapId = React.useId().replace(/[:]/g, '');

  // Check API availability on mount
  React.useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(s => setStatus({ ...s, checked: true })).catch(() => setStatus({ anthropic: false, dataforseo: false, checked: true }));
  }, []);

  useAtlasMap('atlas-map-' + mapId, { selected, setSelected, nicheFilters, quadrantFilters, setViewportIds });

  // Compute resolved include/exclude lists once per change
  const { includeNiches, excludeNiches } = React.useMemo(() => {
    const all = window.MIutil.niches();
    const inc = [], exc = [];
    Object.entries(nicheFilters).forEach(([id, v]) => {
      const n = all.find(x => x.id === id);
      if (!n) return;
      if (v === 'include') inc.push(n);
      if (v === 'exclude') exc.push(n);
    });
    return { includeNiches: inc, excludeNiches: exc };
  }, [nicheFilters]);

  const anyQuad = Object.values(quadrantFilters).some(Boolean);
  const activeQuadKeys = Object.keys(quadrantFilters).filter(k => quadrantFilters[k]);

  const allCombos = React.useMemo(() => window.MIutil.buildCombos(), []);

  // One row per metro for the rankings table
  const allMetroRows = React.useMemo(() => {
    return window.METROS.map(metro => {
      const q = window.MIutil.quadrant(metro.growth, metro.income);
      const score = (metro.growth + metro.income) / 2;
      return { metro, q, score };
    });
  }, []);

  // City rows — built when zoom ≥ 8
  const allCityRows = React.useMemo(() => {
    return (window.CITIES || []).map(city => {
      const q     = window.MIutil.quadrant ? window.MIutil.quadrant(city.growth, city.income)
                  : { color:'rgba(255,255,255,0.3)', label:'Watch List', key:'watch' };
      const score = (city.growth + city.income) / 2;
      return { metro: city, q, score, isCity: true };
    });
  }, []);

  const filteredMetroRows = React.useMemo(() => {
    // Base rows: always include cities (population slider controls what's visible)
    let r = [...allMetroRows, ...allCityRows];

    // Population range filter — dim is on map; table hides outside range
    r = r.filter(row => { const p = row.metro.pop || 0; return p >= minPopFilter && p <= maxPopFilter; });

    // Viewport filter — only show items in current map bounds
    if (viewportIds && viewportIds.size > 0) {
      r = r.filter(row => {
        const key = row.isCity ? 'city:'+row.metro.id : 'metro:'+row.metro.id;
        return viewportIds.has(key);
      });
    }

    if (includeNiches.length) r = r.filter(row => includeNiches.some(n => window.MIutil.isStrong(n, row.metro) && row.metro.growth >= 6));
    if (excludeNiches.length) r = r.filter(row => !excludeNiches.some(n => window.MIutil.isStrong(n, row.metro) && row.metro.growth >= 6));
    if (anyQuad) r = r.filter(row => quadrantFilters[row.q.key]);

    // Sort by score desc
    r.sort((a,b) => b.score - a.score);
    return r;
  }, [allMetroRows, allCityRows, minPopFilter, maxPopFilter, viewportIds,
      includeNiches, excludeNiches, quadrantFilters, anyQuad]);

  const topCombo = allCombos[0];
  const selectedMetro = selected
    ? (window.METROS.find(m => m.id === selected) || (window.CITIES||[]).find(c => c.id === selected))
    : null;

  const setNicheFilter = React.useCallback((id, state /* 'include' | 'exclude' | null */) => {
    setNicheFilters(prev => {
      const next = { ...prev };
      if (state == null) delete next[id]; else next[id] = state;
      return next;
    });
  }, []);
  const toggleQuadrant = React.useCallback((key) => {
    setQuadrantFilters(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = true;
      return next;
    });
  }, []);
  const clearAllFilters = React.useCallback(() => {
    setNicheFilters({});
    setQuadrantFilters({});
  }, []);

  // Resolve a niche id from a free-form name (used by highlight chips, which use
  // short names like 'HVAC' or 'Landscaping' rather than full niche labels).
  const findNicheByName = React.useCallback((name) => {
    if (!name) return null;
    const lc = name.toLowerCase();
    const all = window.MIutil.niches();
    return (
      all.find(n => n.name.toLowerCase() === lc) ||
      all.find(n => n.name.toLowerCase().startsWith(lc)) ||
      all.find(n => n.name.toLowerCase().includes(lc)) ||
      all.find(n => lc.includes(n.name.toLowerCase())) ||
      null
    );
  }, []);
  // Pick a niche as the deep-analysis target. Accepts an id, a niche object, or a free name.
  const pickNiche = React.useCallback((nicheOrIdOrName) => {
    if (nicheOrIdOrName == null) { setNicheSel(null); return; }
    if (typeof nicheOrIdOrName === 'object') { setNicheSel(nicheOrIdOrName.id); return; }
    const all = window.MIutil.niches();
    const byId = all.find(n => n.id === nicheOrIdOrName);
    if (byId) { setNicheSel(byId.id); return; }
    const byName = findNicheByName(nicheOrIdOrName);
    if (byName) setNicheSel(byName.id);
  }, [findNicheByName]);

  const openAnalysis = async (metro, niche) => {
    setLoadingAnalysis({ metro, niche, error: null });
    try {
      const result = await runDeepAnalysis(metro, niche);
      setLoadingAnalysis(null);
      setAnalysis(result);
    } catch (err) {
      // Show the error inside the loader so the user sees what went wrong,
      // and offer a fallback to mock data so the demo flow never dead-ends.
      console.error('Deep analysis failed:', err);
      setLoadingAnalysis({ metro, niche, error: err.message || String(err) });
    }
  };
  const cancelAnalysis = () => setLoadingAnalysis(null);
  const handleAnalyzeFromDetail = () => {
    if (!selectedMetro) return;
    const targetNiche = nicheSel
      ? window.MIutil.niches().find(n => n.id === nicheSel)
      : window.MIutil.niches().find(n => window.MIutil.isStrong(n, selectedMetro)) || window.MIutil.niches()[0];
    openAnalysis(selectedMetro, targetNiche);
  };

  // Density scales paddings/sizes — we set a CSS var the table can read.
  const densityScale = t.density === 'compact' ? 0.85 : t.density === 'comfy' ? 1.15 : 1;
  const mapMinHeight = t.density === 'compact' ? 320 : t.density === 'comfy' ? 420 : 380;

  // Use a semi-transparent paper for the map's floating info chip, derived from current tokens.
  const overlayBg = t.paperTone === 'evening' ? 'rgba(27,29,34,0.86)' : 'rgba(247,243,232,0.92)';

  return (
    <div style={{
      width:'100%', height:'100%', background:atlasTokens.paper, color:atlasTokens.ink,
      fontFamily:atlasTokens.sans, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden',
      ['--atlas-density']: densityScale,
    }}>
      <AtlasTopBar status={status} onPulse={() => setShowPulse(true)} onGap={() => setShowGap(true)} />
      {showPulse && window.MarketPulse && React.createElement(window.MarketPulse, { tokens: atlasTokens, onClose: () => setShowPulse(false) })}
      {showGap && window.GapFinder && React.createElement(window.GapFinder, {
        tokens: atlasTokens,
        selectedMetro: selectedMetro,
        onClose: () => setShowGap(false),
        onAnalyze: (metro, nicheName) => { setShowGap(false); pickMetro(metro.id); pickNiche(nicheName); },
      })}

      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* Left rail — niche overlay */}
        <div style={{
          width:280, flexShrink:0, padding:'20px 18px', borderRight:`1px solid ${atlasTokens.rule}`,
          overflow:'auto', background:atlasTokens.paper,
        }}>
          {/* Population range filter */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8,
                            textTransform:'uppercase', color:atlasTokens.dim }}>
                Population Range
              </div>
              <div style={{ fontFamily:atlasTokens.mono, fontSize:11, color:atlasTokens.ink2 }}>
                {minPopFilter>=1000000?(minPopFilter/1000000).toFixed(1)+'M':`${Math.round(minPopFilter/1000)}k`}
                {' – '}
                {maxPopFilter>=20000000?'20M+':maxPopFilter>=1000000?`${(maxPopFilter/1000000).toFixed(0)}M`:`${Math.round(maxPopFilter/1000)}k`}
              </div>
            </div>
            <DualRangeSlider
              steps={[50000,100000,250000,500000,1000000,2000000,5000000,10000000,20000000]}
              lo={minPopFilter} hi={maxPopFilter}
              onChangeLo={v => setMinPopFilter(v)}
              onChangeHi={v => setMaxPopFilter(v)}
              format={v => v>=1000000?`${(v/1000000).toFixed(0)}M`:v>=1000?`${Math.round(v/1000)}k`:`${v}`}
              tokens={atlasTokens}
            />
            {(minPopFilter > 0 || maxPopFilter < 20000000) && (
              <button onClick={() => { setMinPopFilter(0); setMaxPopFilter(20000000); }}
                style={{ background:'none', border:'none', cursor:'pointer', marginTop:8,
                         fontFamily:atlasTokens.mono, fontSize:9, color:atlasTokens.accent,
                         textDecoration:'underline', textUnderlineOffset:2 }}>
                Reset filter
              </button>
            )}
          </div>

          {/* Data freshness + Census refresh */}
          <div style={{ marginBottom:20, padding:'10px 12px', background:atlasTokens.card,
                         border:`1px solid ${atlasTokens.rule}`, borderRadius:8 }}>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.5,
                          textTransform:'uppercase', color:atlasTokens.dim, marginBottom:6 }}>
              City Data
            </div>
            <div style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted,
                          marginBottom:8, lineHeight:1.5 }}>
              {dataFreshness
                ? `Updated ${new Date(dataFreshness).toLocaleDateString()}`
                : (window.CITIES_LAST_UPDATED
                    ? `Static · ${window.CITIES_LAST_UPDATED}`
                    : 'Static pre-scored data')}
            </div>
            <button onClick={async () => {
              setEnriching(true);
              try {
                const cities = window.CITIES || [];
                const res  = await fetch('/api/census/enrich-all', {
                  method:'POST', headers:{'Content-Type':'application/json'},
                  body: JSON.stringify({ cities }),
                });
                const data = await res.json();
                if (data.enriched) {
                  // Merge enriched scores back into window.CITIES
                  const map = {};
                  data.enriched.forEach(c => { map[c.id] = c; });
                  (window.CITIES||[]).forEach((c,i) => {
                    const m = map[c.id];
                    if (m?.census_matched) {
                      window.CITIES[i].income = m.income;
                      if (m.growth !== undefined) window.CITIES[i].growth = m.growth;
                      window.CITIES[i].census_income  = m.census_income;
                      window.CITIES[i].growth_pct_3yr = m.growth_pct_3yr;
                    }
                  });
                  // Enrich metros too
                  (window.METROS||[]).forEach((m,i) => {
                    const e = data.enriched.find(c => c.id === m.id);
                    if (e?.census_matched) {
                      window.METROS[i].income = e.income;
                      if (e.growth !== undefined) window.METROS[i].growth = e.growth;
                    }
                  });
                  const ts = data.fetched_at;
                  setDataFreshness(ts);
                  localStorage.setItem('atlas_census_ts', ts);
                }
              } catch(e) { console.error('Enrich error:', e); }
              setEnriching(false);
            }} disabled={enriching}
              style={{ width:'100%', padding:'6px 0', borderRadius:6, cursor:'pointer',
                       fontFamily:atlasTokens.mono, fontSize:10, fontWeight:600,
                       background: enriching ? 'transparent' : `${atlasTokens.accent}18`,
                       border:`1px solid ${atlasTokens.accent}44`,
                       color: atlasTokens.accent, opacity: enriching ? 0.5 : 1 }}>
              {enriching ? 'Refreshing…' : '↻ Refresh from Census'}
            </button>
          </div>

          <div style={{ marginBottom:22 }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:11 }}>
              <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.dim }}>
                Quadrants
              </div>
              {anyQuad && (
                <button onClick={() => setQuadrantFilters({})} style={{
                  fontFamily:atlasTokens.mono, fontSize:9.5, padding:'2px 7px', borderRadius:3,
                  background:'transparent', border:`1px solid ${atlasTokens.rule}`, color:atlasTokens.muted,
                  cursor:'pointer', letterSpacing:0.3,
                }}>clear</button>
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              <AtlasLegendItem swatch={atlasTokens.sweet}  label="Sweet Spot"   sub="growth 7+ · income 7+" active={!!quadrantFilters.sweet}  onClick={() => toggleQuadrant('sweet')} />
              <AtlasLegendItem swatch={atlasTokens.growth} label="Demand Rich"  sub="growth 7+ · income <7" active={!!quadrantFilters.growth} onClick={() => toggleQuadrant('growth')} />
              <AtlasLegendItem swatch={atlasTokens.comp}   label="Competitive"  sub="growth <7 · income 7+" active={!!quadrantFilters.comp}   onClick={() => toggleQuadrant('comp')} />
              <AtlasLegendItem swatch={atlasTokens.watch}  label="Watch List"   sub="below thresholds"      active={!!quadrantFilters.watch}  onClick={() => toggleQuadrant('watch')} />
            </div>
          </div>

          <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.8, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:8 }}>
            Niche overlay
          </div>
          <div style={{ fontFamily:atlasTokens.sans, fontSize:11.5, color:atlasTokens.muted, lineHeight:1.55, marginBottom:14 }}>
            Pick a service to highlight where it's a regional fit on the map and filter the board.
          </div>
          <AtlasNichePanel
            nicheFilters={nicheFilters}
            setNicheFilter={setNicheFilter}
            clearAllFilters={clearAllFilters}
            pickNiche={pickNiche}
          />
        </div>

        {/* Center — map + table */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, padding:18, gap:16 }}>
          <div style={{ flex:'1 1 0', minHeight:mapMinHeight, borderRadius:10, overflow:'hidden', border:`1px solid ${atlasTokens.rule}`, position:'relative' }}>
            <div id={'atlas-map-' + mapId} style={{ width:'100%', height:'100%', background:atlasTokens.card }} />
            {/* Map overlay info corner */}
            <div style={{ position:'absolute', top:14, left:14, padding:'9px 13px', background:overlayBg, border:`1px solid ${atlasTokens.rule}`, borderRadius:6, backdropFilter:'blur(4px)' }}>
              <div style={{ fontFamily:atlasTokens.mono, fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:atlasTokens.dim, marginBottom:2 }}>
                {selectedMetro ? 'Selected metro' : 'Continental United States'}
              </div>
              <div style={{ fontFamily:atlasTokens.display, fontSize:16, color:atlasTokens.ink, fontWeight:500 }}>
                {selectedMetro ? `${selectedMetro.name}, ${selectedMetro.state}` : `${window.METROS.length} metros tracked`}
              </div>
            </div>
            {/* Quadrant summary chip — bottom-right */}
            <div style={{ position:'absolute', bottom:14, right:14, padding:'7px 11px', background:overlayBg, border:`1px solid ${atlasTokens.rule}`, borderRadius:6, backdropFilter:'blur(4px)', display:'flex', gap:10 }}>
              {[
                ['sweet', 'sweet spot', window.METROS.filter(m => m.growth >= 7 && m.income >= 7).length],
                ['growth','growth-rich', window.METROS.filter(m => m.growth >= 7 && m.income < 7).length],
                ['comp',  'competitive', window.METROS.filter(m => m.growth < 7 && m.income >= 7).length],
                ['watch', 'watch', window.METROS.filter(m => m.growth < 7 && m.income < 7).length],
              ].map(([k, l, n]) => (
                <div key={k} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:atlasTokens[k==='sweet'?'sweet':k==='growth'?'growth':k==='comp'?'comp':'watch'] }} />
                  <span style={{ fontFamily:atlasTokens.mono, fontSize:9.5, color:atlasTokens.muted, letterSpacing:0.3 }}>{n} {l}</span>
                </div>
              ))}
            </div>
            {(includeNiches.length > 0 || excludeNiches.length > 0) && (
              <div style={{ position:'absolute', bottom:14, left:14, padding:'8px 12px', background:overlayBg, border:`1px solid ${atlasTokens.rule}`, borderRadius:6, backdropFilter:'blur(4px)', maxWidth:380 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.dim, letterSpacing:1.2, textTransform:'uppercase' }}>Filter overlay</span>
                  {includeNiches.slice(0, 3).map(n => (
                    <span key={'mi-'+n.id} style={{
                      fontFamily:atlasTokens.sans, fontSize:11, color:n.cat.color, fontWeight:500,
                      display:'inline-flex', alignItems:'center', gap:4,
                    }}>
                      <span style={{ width:4, height:4, borderRadius:1, background:n.cat.color }} />+{n.name}
                    </span>
                  ))}
                  {includeNiches.length > 3 && (
                    <span style={{ fontFamily:atlasTokens.mono, fontSize:10, color:atlasTokens.muted }}>+{includeNiches.length-3} more</span>
                  )}
                  {excludeNiches.slice(0, 2).map(n => (
                    <span key={'me-'+n.id} style={{
                      fontFamily:atlasTokens.sans, fontSize:11, color:atlasTokens.bad, fontWeight:500,
                      textDecoration:'line-through', textDecorationColor:`${atlasTokens.bad}88`,
                    }}>−{n.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex:'1.4 1 0', minHeight:300, display:'flex', flexDirection:'column' }}>
            <AtlasTable
              rows={filteredMetroRows}
              selected={selected}
              includeNiches={includeNiches}
              excludeNiches={excludeNiches}
              quadrantFilters={quadrantFilters}
              setSelected={setSelected}
              onClearMetro={() => setSelected(null)}
              clearAllFilters={clearAllFilters}
              viewportActive={!!(viewportIds && viewportIds.size > 0)}
              totalRows={(window.METROS||[]).length+(window.CITIES||[]).length}
              limit={t.tableLimit}
            />
          </div>
        </div>

        {/* Right rail */}
        <div style={{ width:380, flexShrink:0, padding:'18px 18px 18px 0', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {selectedMetro
            ? <AtlasMetroDetail
                metro={selectedMetro}
                onClear={() => setSelected(null)}
                onAnalyze={openAnalysis}
                nicheSel={nicheSel}
                pickNiche={pickNiche}
                includeNiches={includeNiches}
                excludeNiches={excludeNiches}
              />
            : <AtlasCoachHint
                topCombo={topCombo}
                allCombos={allCombos}
                onAnalyze={() => openAnalysis(topCombo.metro, topCombo.niche)}
                onSelectMetro={setSelected}
                pickNiche={pickNiche}
              />
          }
        </div>
      </div>

      {/* Loading overlay */}
      {loadingAnalysis && (
        <AtlasAnalysisLoader
          metro={loadingAnalysis.metro}
          niche={loadingAnalysis.niche}
          error={loadingAnalysis.error}
          onCancel={cancelAnalysis}
        />
      )}

      <AtlasAnalysisModal analysis={analysis} onClose={() => setAnalysis(null)} />

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent" />
        <TweakRadio
          label="Color"
          value={t.accent}
          options={[
            { label: 'Sage',       value: 'sage' },
            { label: 'Ocean',      value: 'ocean' },
            { label: 'Amber',      value: 'amber' },
            { label: 'Terracotta', value: 'terracotta' },
          ]}
          onChange={v => setTweak('accent', v)}
        />
        <TweakSection label="Paper" />
        <TweakRadio
          label="Tone"
          value={t.paperTone}
          options={[
            { label: 'Cream',   value: 'cream' },
            { label: 'Bone',    value: 'bone' },
            { label: 'Mist',    value: 'mist' },
            { label: 'Evening', value: 'evening' },
          ]}
          onChange={v => setTweak('paperTone', v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={v => setTweak('density', v)}
        />
        <TweakSlider
          label="Table rows"
          value={t.tableLimit}
          min={20} max={200} step={10}
          onChange={v => setTweak('tableLimit', v)}
        />
      </TweaksPanel>
    </div>
  );
}

window.AtlasApp = AtlasApp;
