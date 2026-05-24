/* global React, window */
// ═══════════════════════════════════════════════════════════
// MARKET PULSE
// Ranks the most-searched service businesses across selected
// metro areas using live DataForSEO keyword volume data.
// ═══════════════════════════════════════════════════════════

const { useState, useEffect, useRef, useCallback } = React;

// ── All metros from data.js ──────────────────────────────
const ALL_METROS = () => window.METROS || [];

// ── All niches flattened from data.js ───────────────────
const ALL_NICHES = () =>
  (window.NICHE_CATS || []).flatMap(cat =>
    cat.niches.map(n => ({ ...n, catLabel: cat.label, catColor: cat.color }))
  );

// ── Default selections ───────────────────────────────────
const DEFAULT_METRO_IDS = ['charlotte','phoenix','nashville','atlanta','tampa'];
const DEFAULT_NICHE_IDS = [
  'hvac','roofing','plumbing','electrical','landscaping','pestctrl',
  'treeservice','waterdam','pool','cleaning','junk','painting',
  'dentist','medspa','seniorcare','chiro','gym',
  'vetclinic','doggrooming','autorepair','locksmith',
  'injury','divorce','dui',
];

// ── Helpers ──────────────────────────────────────────────
function fmtVol(v) {
  if (!v) return '—';
  if (v >= 10000) return `${(v/1000).toFixed(0)}k`;
  if (v >= 1000)  return `${(v/1000).toFixed(1)}k`;
  return v.toLocaleString();
}

function heatColor(vol, maxVol, tokens) {
  if (!vol || !maxVol) return 'transparent';
  const t = Math.min(vol / maxVol, 1);
  // Sage accent at full intensity, paper at zero
  const r = parseInt(tokens.accent.slice(1,3),16);
  const g = parseInt(tokens.accent.slice(3,5),16);
  const b = parseInt(tokens.accent.slice(5,7),16);
  return `rgba(${r},${g},${b},${(t * 0.35 + 0.03).toFixed(2)})`;
}

function volTextColor(vol, maxVol, tokens) {
  if (!vol) return tokens.dim;
  const t = vol / maxVol;
  return t > 0.5 ? tokens.ink : t > 0.15 ? tokens.ink2 : tokens.muted;
}

// ─────────────────────────────────────────────────────────
// Metro Selector chip strip
// ─────────────────────────────────────────────────────────
function MetroChips({ selected, onToggle, tokens }) {
  const metros = ALL_METROS();
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
      {metros.map(m => {
        const on = selected.includes(m.id);
        return (
          <button key={m.id} onClick={() => onToggle(m.id)}
            style={{
              padding:'4px 10px', borderRadius:20, cursor:'pointer',
              fontFamily: tokens.mono, fontSize:11, fontWeight: on ? 600 : 400,
              border: `1px solid ${on ? tokens.accent : tokens.rule}`,
              background: on ? `${tokens.accent}18` : 'transparent',
              color: on ? tokens.accent : tokens.muted,
              transition:'all .15s',
            }}>
            {m.name}, {m.state}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Category filter panel
// ─────────────────────────────────────────────────────────
function CategoryPanel({ selected, onToggle, onSelectAll, onClearAll, tokens }) {
  const cats = window.NICHE_CATS || [];
  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:10 }}>
        <button onClick={onSelectAll} style={linkBtn(tokens)}>Select all</button>
        <span style={{ color: tokens.dim }}>·</span>
        <button onClick={onClearAll} style={linkBtn(tokens)}>Clear all</button>
      </div>
      {cats.map(cat => (
        <div key={cat.id} style={{ marginBottom:10 }}>
          <div style={{ fontFamily:tokens.mono, fontSize:10, color:tokens.muted,
                        letterSpacing:'0.08em', textTransform:'uppercase',
                        marginBottom:5, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:8, height:8, borderRadius:'50%',
                           background:cat.color, display:'inline-block' }}/>
            {cat.label}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {cat.niches.map(n => {
              const on = selected.includes(n.id);
              return (
                <button key={n.id} onClick={() => onToggle(n.id)}
                  style={{
                    padding:'3px 9px', borderRadius:14, cursor:'pointer',
                    fontFamily:tokens.sans, fontSize:11,
                    border:`1px solid ${on ? cat.color+'88' : tokens.rule}`,
                    background: on ? cat.color+'18' : 'transparent',
                    color: on ? cat.color : tokens.muted,
                    transition:'all .15s',
                  }}>
                  {n.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function linkBtn(tokens) {
  return {
    background:'none', border:'none', cursor:'pointer', padding:0,
    fontFamily:tokens.mono, fontSize:11, color:tokens.accent,
    textDecoration:'underline', textUnderlineOffset:2,
  };
}

// ─────────────────────────────────────────────────────────
// Heatmap table
// ─────────────────────────────────────────────────────────
function PulseTable({ data, metros, sortMetroId, setSortMetroId, tokens }) {
  const { matrix } = data;

  // Compute per-metro max for normalisation
  const metroMax = {};
  metros.forEach(m => {
    metroMax[m.id] = Math.max(1, ...matrix.map(r => r.metros[m.id]?.volume || 0));
  });
  const globalMax = Math.max(1, ...matrix.map(r => r.total_volume));

  const sorted = [...matrix].sort((a, b) => {
    if (sortMetroId === '__total__') return b.total_volume - a.total_volume;
    return (b.metros[sortMetroId]?.volume || 0) - (a.metros[sortMetroId]?.volume || 0);
  });

  const th = (label, key, extra = {}) => (
    <th key={key} onClick={() => setSortMetroId(key)}
      style={{
        padding:'8px 12px', fontFamily:tokens.mono, fontSize:10, fontWeight:600,
        letterSpacing:'0.06em', textTransform:'uppercase', color: sortMetroId === key ? tokens.accent : tokens.muted,
        borderBottom:`1px solid ${tokens.ruleHi}`, borderRight:`1px solid ${tokens.rule}`,
        background: tokens.card, textAlign:'center', cursor:'pointer',
        whiteSpace:'nowrap', userSelect:'none', ...extra,
      }}>
      {label} {sortMetroId === key ? '↓' : ''}
    </th>
  );

  return (
    <div style={{ overflowX:'auto', borderRadius:8, border:`1px solid ${tokens.ruleHi}` }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead>
          <tr>
            <th style={{
              padding:'8px 14px', fontFamily:tokens.mono, fontSize:10, fontWeight:600,
              letterSpacing:'0.06em', textTransform:'uppercase', color:tokens.muted,
              borderBottom:`1px solid ${tokens.ruleHi}`, borderRight:`1px solid ${tokens.rule}`,
              background:tokens.card, textAlign:'left', whiteSpace:'nowrap',
            }}>
              Service Category
            </th>
            {metros.map(m => th(`${m.name}`, m.id))}
            {th('Total', '__total__', { textAlign:'right' })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const cat = window.NICHE_CATS?.find(c => c.niches.some(n => n.id === row.category.id));
            return (
              <tr key={row.category.id}
                style={{ background: i % 2 === 0 ? tokens.paper : tokens.card }}>
                {/* Category name */}
                <td style={{
                  padding:'7px 14px', borderBottom:`1px solid ${tokens.rule}`,
                  borderRight:`1px solid ${tokens.rule}`, whiteSpace:'nowrap',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%',
                                   background: cat?.color || tokens.dim,
                                   flexShrink:0, display:'inline-block' }}/>
                    <span style={{ fontFamily:tokens.sans, color:tokens.ink, fontWeight:500 }}>
                      {row.category.name}
                    </span>
                  </div>
                  <div style={{ fontFamily:tokens.mono, fontSize:10, color:tokens.dim,
                                marginTop:1, paddingLeft:13 }}>
                    {row.category.rental || ''}
                  </div>
                </td>
                {/* Per-metro volume cells */}
                {metros.map(m => {
                  const cell = row.metros[m.id] || {};
                  const vol  = cell.volume || 0;
                  const bg   = heatColor(vol, metroMax[m.id], tokens);
                  const fg   = volTextColor(vol, metroMax[m.id], tokens);
                  const ci   = cell.competition_index || 0;
                  return (
                    <td key={m.id} title={`"${cell.keyword}"\nVolume: ${vol?.toLocaleString()}\nCompetition: ${ci}/100\nCPC: $${cell.cpc?.toFixed(2)||'0.00'}`}
                      style={{
                        padding:'7px 10px', background:bg,
                        borderBottom:`1px solid ${tokens.rule}`,
                        borderRight:`1px solid ${tokens.rule}`,
                        textAlign:'center', cursor:'default',
                      }}>
                      <div style={{ fontFamily:tokens.mono, fontWeight:600, color:fg }}>
                        {fmtVol(vol)}
                      </div>
                      {ci > 0 && (
                        <div style={{ fontFamily:tokens.mono, fontSize:9, color:tokens.dim, marginTop:1 }}>
                          ci {ci}
                        </div>
                      )}
                    </td>
                  );
                })}
                {/* Total */}
                <td style={{
                  padding:'7px 12px', background: heatColor(row.total_volume, globalMax, tokens),
                  borderBottom:`1px solid ${tokens.rule}`, textAlign:'right',
                }}>
                  <span style={{ fontFamily:tokens.mono, fontWeight:700,
                                 color: volTextColor(row.total_volume, globalMax, tokens) }}>
                    {fmtVol(row.total_volume)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Summary bar — top insights at a glance
// ─────────────────────────────────────────────────────────
function SummaryBar({ data, tokens }) {
  const { matrix, metros } = data;
  if (!matrix.length) return null;

  const topNiche  = matrix[0];
  const metroTotals = metros.map(m => ({
    ...m,
    total: matrix.reduce((s, r) => s + (r.metros[m.id]?.volume || 0), 0),
  }));
  metroTotals.sort((a, b) => b.total - a.total);
  const topMetro = metroTotals[0];

  const totalSearches = matrix.reduce((s, r) => s + r.total_volume, 0);

  const stat = (label, value) => (
    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
      <div style={{ fontFamily:tokens.mono, fontSize:10, color:tokens.muted,
                    letterSpacing:'0.07em', textTransform:'uppercase' }}>{label}</div>
      <div style={{ fontFamily:tokens.display||tokens.sans, fontSize:15,
                    fontWeight:600, color:tokens.ink }}>{value}</div>
    </div>
  );

  return (
    <div style={{
      display:'flex', gap:28, padding:'14px 20px',
      background:tokens.cardHi, borderRadius:8,
      border:`1px solid ${tokens.ruleHi}`, flexWrap:'wrap', marginBottom:16,
    }}>
      {stat('Top Service',  topNiche.category.name)}
      {stat('Top Market',   `${topMetro.name}, ${topMetro.state}`)}
      {stat('Total Searches', fmtVol(totalSearches) + '/mo')}
      {stat('Services Tracked', matrix.length)}
      {stat('Markets', metros.length)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main MarketPulse component
// ─────────────────────────────────────────────────────────
function MarketPulse({ tokens, onClose }) {
  const [tab,           setTab]          = useState('setup');   // 'setup' | 'results'
  const [selMetros,     setSelMetros]    = useState(DEFAULT_METRO_IDS);
  const [selNiches,     setSelNiches]    = useState(DEFAULT_NICHE_IDS);
  const [showCatPanel,  setShowCatPanel] = useState(false);
  const [loading,       setLoading]      = useState(false);
  const [loadMsg,       setLoadMsg]      = useState('');
  const [data,          setData]         = useState(null);
  const [error,         setError]        = useState(null);
  const [sortMetroId,   setSortMetroId]  = useState('__total__');
  const [dfsAvail,      setDfsAvail]     = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/api/status').then(r => r.json())
      .then(s => setDfsAvail(!!s.dataforseo))
      .catch(() => setDfsAvail(false));
    return () => clearInterval(timerRef.current);
  }, []);

  function toggleMetro(id) {
    setSelMetros(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleNiche(id) {
    setSelNiches(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function runPulse() {
    if (!selMetros.length || !selNiches.length) return;
    setLoading(true); setError(null); setData(null);

    const msgs = [
      'Building keyword queries…',
      'Sending to DataForSEO…',
      'Receiving volume data…',
      'Assembling matrix…',
    ];
    let mi = 0;
    setLoadMsg(msgs[0]);
    timerRef.current = setInterval(() => {
      mi = (mi + 1) % msgs.length;
      setLoadMsg(msgs[mi]);
    }, 2200);

    try {
      const metros = ALL_METROS().filter(m => selMetros.includes(m.id));
      const allNiches = ALL_NICHES();
      const categories = allNiches.filter(n => selNiches.includes(n.id))
        .map(n => ({ id: n.id, name: n.name, rental: n.rental }));

      const res = await fetch('/api/dfs/market-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metros, categories }),
      });
      const json = await res.json();
      if (json.dfs_error) throw new Error(json.message);
      setData(json);
      setTab('results');
      setSortMetroId('__total__');
    } catch (e) {
      setError(e.message);
    } finally {
      clearInterval(timerRef.current);
      setLoading(false);
    }
  }

  // ── Styles ──────────────────────────────────────────────
  const s = {
    overlay: {
      position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
      backdropFilter:'blur(4px)', zIndex:3000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    },
    modal: {
      background:tokens.paper, border:`1px solid ${tokens.ruleHi}`,
      borderRadius:12, width:'100%', maxWidth:1100, maxHeight:'90vh',
      display:'flex', flexDirection:'column',
      boxShadow:'0 24px 80px rgba(0,0,0,0.25)', overflow:'hidden',
    },
    header: {
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'16px 22px', borderBottom:`1px solid ${tokens.rule}`, flexShrink:0,
    },
    title: {
      fontFamily:tokens.display||tokens.sans, fontSize:20, fontWeight:600,
      color:tokens.ink, letterSpacing:'-0.01em',
    },
    body: { flex:1, overflowY:'auto', padding:'20px 22px' },
    tabs: { display:'flex', gap:0, borderBottom:`1px solid ${tokens.rule}`,
             flexShrink:0, paddingLeft:22 },
    tabBtn: (active) => ({
      padding:'10px 18px', border:'none', background:'none', cursor:'pointer',
      fontFamily:tokens.mono, fontSize:11, letterSpacing:'0.06em',
      textTransform:'uppercase', color: active ? tokens.accent : tokens.muted,
      borderBottom: `2px solid ${active ? tokens.accent : 'transparent'}`,
      marginBottom:-1, transition:'all .15s',
    }),
    section: { marginBottom:20 },
    sectionLabel: {
      fontFamily:tokens.mono, fontSize:10, color:tokens.muted,
      letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10,
    },
    runBtn: {
      padding:'10px 24px', borderRadius:8, cursor:'pointer', fontFamily:tokens.mono,
      fontSize:12, fontWeight:600, letterSpacing:'0.04em',
      background: tokens.accent, color:'#fff', border:'none',
      opacity: (selMetros.length && selNiches.length && !loading) ? 1 : 0.4,
      transition:'opacity .2s',
    },
    closeBtn: {
      background:'none', border:`1px solid ${tokens.rule}`, borderRadius:6,
      padding:'5px 12px', cursor:'pointer', fontFamily:tokens.mono,
      fontSize:11, color:tokens.muted,
    },
    chip: (active) => ({
      padding:'5px 12px', borderRadius:6, cursor:'pointer', fontFamily:tokens.mono,
      fontSize:11, border:`1px solid ${active ? tokens.accent : tokens.rule}`,
      background: active ? `${tokens.accent}14` : 'transparent',
      color: active ? tokens.accent : tokens.muted,
    }),
    errorBox: {
      background:`${tokens.bad||'#b54b35'}14`, border:`1px solid ${tokens.bad||'#b54b35'}44`,
      borderRadius:8, padding:'12px 16px', color:tokens.bad||'#b54b35',
      fontFamily:tokens.mono, fontSize:12, lineHeight:1.6,
    },
    infoBox: {
      background:`${tokens.accent}0f`, border:`1px solid ${tokens.accent}33`,
      borderRadius:8, padding:'12px 16px', fontFamily:tokens.mono,
      fontSize:11, color:tokens.ink2, lineHeight:1.6,
    },
  };

  const queryCount = selMetros.length * selNiches.length;
  const estimatedCost = (queryCount * 0.002).toFixed(2);

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.title}>Market Pulse</div>
            <div style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.muted, marginTop:3 }}>
              Top searched service businesses · live keyword volume
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕ Close</button>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={s.tabBtn(tab==='setup')}   onClick={() => setTab('setup')}>Setup</button>
          <button style={s.tabBtn(tab==='results')} onClick={() => setTab('results')}
            disabled={!data}>
            Results {data ? `(${data.matrix.length} services)` : ''}
          </button>
        </div>

        <div style={s.body}>

          {/* ── SETUP TAB ─────────────────────────────── */}
          {tab === 'setup' && (
            <>
              {/* DFS status */}
              {dfsAvail === false && (
                <div style={{ ...s.infoBox, marginBottom:16 }}>
                  ○ DataForSEO not configured — add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD
                  to your .env and restart the container. All queries require live DataForSEO access.
                </div>
              )}

              {/* Metro selector */}
              <div style={s.section}>
                <div style={s.sectionLabel}>
                  Select metros ({selMetros.length} selected)
                </div>
                <MetroChips selected={selMetros} onToggle={toggleMetro} tokens={tokens}/>
              </div>

              {/* Category selector */}
              <div style={s.section}>
                <div style={{ display:'flex', alignItems:'center',
                               justifyContent:'space-between', marginBottom:10 }}>
                  <div style={s.sectionLabel} >
                    Service categories ({selNiches.length} selected)
                  </div>
                  <button style={linkBtn(tokens)} onClick={() => setShowCatPanel(p=>!p)}>
                    {showCatPanel ? 'Hide' : 'Customize'}
                  </button>
                </div>
                {showCatPanel
                  ? <CategoryPanel
                      selected={selNiches} onToggle={toggleNiche}
                      onSelectAll={() => setSelNiches(ALL_NICHES().map(n => n.id))}
                      onClearAll={() => setSelNiches([])}
                      tokens={tokens}/>
                  : (
                    <div style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.muted }}>
                      {selNiches.length} service categories selected across{' '}
                      {(window.NICHE_CATS||[]).length} groups.{' '}
                      <button style={linkBtn(tokens)} onClick={() => setShowCatPanel(true)}>
                        Customize →
                      </button>
                    </div>
                  )
                }
              </div>

              {/* Cost estimate + run */}
              <div style={{ display:'flex', alignItems:'center',
                             gap:16, padding:'16px 0', borderTop:`1px solid ${tokens.rule}` }}>
                <button style={s.runBtn}
                  onClick={runPulse}
                  disabled={!selMetros.length || !selNiches.length || loading || !dfsAvail}>
                  {loading ? loadMsg : '▶ Run Market Pulse'}
                </button>
                {queryCount > 0 && (
                  <div style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.muted }}>
                    {queryCount} queries · ~${estimatedCost} DataForSEO cost
                  </div>
                )}
              </div>

              {error && <div style={s.errorBox}>⚠ {error}</div>}
            </>
          )}

          {/* ── RESULTS TAB ───────────────────────────── */}
          {tab === 'results' && data && (
            <>
              <SummaryBar data={data} tokens={tokens}/>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                             marginBottom:12, flexWrap:'wrap', gap:8 }}>
                <div style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.muted }}>
                  Sort by column header · hover a cell for full query details
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ ...linkBtn(tokens), fontSize:11 }}
                    onClick={() => setTab('setup')}>← Adjust settings</button>
                  <button style={{ ...linkBtn(tokens), fontSize:11 }}
                    onClick={() => {
                      const rows = [
                        ['Category', 'Rental', ...data.metros.map(m=>`${m.name} ${m.state}`), 'Total'],
                        ...data.matrix.map(r => [
                          r.category.name, r.category.rental||'',
                          ...data.metros.map(m => r.metros[m.id]?.volume||0),
                          r.total_volume,
                        ]),
                      ];
                      const csv = rows.map(r=>r.join(',')).join('\n');
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
                      a.download = `market-pulse-${new Date().toISOString().slice(0,10)}.csv`;
                      a.click();
                    }}>
                    Export CSV
                  </button>
                </div>
              </div>

              <PulseTable
                data={data} metros={data.metros}
                sortMetroId={sortMetroId} setSortMetroId={setSortMetroId}
                tokens={tokens}/>

              <div style={{ fontFamily:tokens.mono, fontSize:10, color:tokens.dim,
                             marginTop:12, textAlign:'right' }}>
                ci = Google Ads competition index (0–100) ·
                Generated {new Date(data.generated_at).toLocaleString()}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

window.MarketPulse = MarketPulse;
