/* global React, window */
// ═══════════════════════════════════════════════════════════
// GAP FINDER
// Claude generates underserved niche hypotheses for a metro,
// DataForSEO validates volume, results ranked by opportunity.
// ═══════════════════════════════════════════════════════════

const { useState, useEffect, useRef } = React;

const STANDARD_NICHES = [
  'HVAC Services','Roofing','Plumbing','Electricians','Lawn & Landscaping',
  'Pest Control','Tree Service','Gutters','Junk Removal','Carpet Cleaning',
  'Interior/Exterior Painting','Pressure Washing','Water Damage Restoration',
  'Foundation Repair','Pool Service & Repair','General Dentistry','Orthodontists',
  'Chiropractors','Physical Therapy','Med Spa / Aesthetics','Mental Health / Therapy',
  'Senior Care / Home Health','Hair Salons','Nail Salons','Massage Therapy',
  'Gyms & Fitness Centers','House Cleaning / Maid','Tattoo & Piercing Studios',
  'Veterinary Clinics','Dog Grooming','Dog Training','Dog Boarding / Daycare',
  'Personal Injury Attorneys','Divorce / Family Law','DUI / Criminal Defense',
  'Bankruptcy Attorneys','Estate Planning Attorneys','Insurance Agents',
  'Auto Repair / Mechanics','Auto Detailing','Windshield Repair','Locksmith',
  'Transmission Repair','Towing Services',
];

function urgBadge(u, tokens) {
  const c = u === 'High' ? tokens.sweet : tokens.warm || tokens.accent;
  return (
    <span style={{ fontFamily:tokens.mono, fontSize:9, padding:'2px 6px', borderRadius:3,
                   background:`${c}18`, border:`1px solid ${c}44`, color:c }}>
      {u}
    </span>
  );
}

function volBar(vol, maxVol, tokens) {
  if (!vol || !maxVol) return null;
  const pct = Math.min(100, Math.round(vol / maxVol * 100));
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ width:80, background:tokens.card, borderRadius:2, height:4 }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:2,
                      background: pct > 60 ? tokens.sweet : pct > 25 ? tokens.accent : tokens.dim }}/>
      </div>
      <span style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.ink2 }}>
        {vol >= 10000 ? `${(vol/1000).toFixed(0)}k` : vol >= 1000 ? `${(vol/1000).toFixed(1)}k` : vol || '—'}/mo
      </span>
    </div>
  );
}

function GapFinder({ tokens, selectedMetro, onClose, onAnalyze }) {
  const ALL_METROS = window.METROS || [];
  const [metro,      setMetro]     = useState(selectedMetro || ALL_METROS[0] || null);
  const [loading,    setLoading]   = useState(false);
  const [loadMsg,    setLoadMsg]   = useState('');
  const [results,    setResults]   = useState(null);
  const [error,      setError]     = useState(null);
  const [dfsOn,      setDfsOn]     = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/api/status').then(r=>r.json()).then(s => setDfsOn(!!s.dataforseo)).catch(()=>{});
    return () => clearInterval(timerRef.current);
  }, []);

  // Keep metro in sync with map selection
  useEffect(() => {
    if (selectedMetro) setMetro(selectedMetro);
  }, [selectedMetro]);

  async function findGaps() {
    if (!metro) return;
    setLoading(true); setError(null); setResults(null);
    const msgs = ['Profiling market demographics…','Generating gap hypotheses with Claude…',
                  dfsOn ? 'Validating volume with DataForSEO…' : 'Ranking opportunities…',
                  'Assembling results…'];
    let mi = 0; setLoadMsg(msgs[0]);
    timerRef.current = setInterval(() => { mi=(mi+1)%msgs.length; setLoadMsg(msgs[mi]); }, 2500);
    try {
      const res = await fetch('/api/gap-finder', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ metro, standard_niches: STANDARD_NICHES }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch(e) { setError(e.message); }
    finally { clearInterval(timerRef.current); setLoading(false); }
  }

  const s = {
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
               backdropFilter:'blur(4px)', zIndex:3000,
               display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
    modal:   { background:tokens.paper, border:`1px solid ${tokens.ruleHi}`,
               borderRadius:12, width:'100%', maxWidth:820, maxHeight:'90vh',
               display:'flex', flexDirection:'column',
               boxShadow:'0 24px 80px rgba(0,0,0,0.3)', overflow:'hidden' },
    header:  { display:'flex', alignItems:'center', justifyContent:'space-between',
               padding:'16px 22px', borderBottom:`1px solid ${tokens.rule}`, flexShrink:0 },
    body:    { flex:1, overflowY:'auto', padding:'20px 22px' },
    closeBtn:{ background:'none', border:`1px solid ${tokens.rule}`, borderRadius:6,
               padding:'5px 12px', cursor:'pointer', fontFamily:tokens.mono,
               fontSize:11, color:tokens.muted },
    label:   { fontFamily:tokens.mono, fontSize:10, color:tokens.muted,
               letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8, display:'block' },
    select:  { width:'100%', background:'#1e2230', border:`1px solid ${tokens.ruleHi}`,
               borderRadius:8, padding:'10px 12px', color:'#e8eaf0', fontFamily:tokens.mono,
               fontSize:12, cursor:'pointer', marginBottom:16 },
    runBtn:  { padding:'10px 22px', borderRadius:8, cursor:'pointer', border:'none',
               fontFamily:tokens.mono, fontSize:12, fontWeight:600,
               background:tokens.accent, color:'#fff',
               opacity: (metro && !loading) ? 1 : 0.4 },
    errorBox:{ background:`${tokens.bad||'#c0392b'}18`, border:`1px solid ${tokens.bad||'#c0392b'}44`,
               borderRadius:8, padding:'12px 16px', color:tokens.bad||'#c0392b',
               fontFamily:tokens.mono, fontSize:12, lineHeight:1.6, marginTop:12 },
    infoBox: { background:`${tokens.accent}0f`, border:`1px solid ${tokens.accent}33`,
               borderRadius:8, padding:'11px 14px', fontFamily:tokens.mono,
               fontSize:11, color:tokens.ink2, lineHeight:1.7, marginBottom:16 },
  };

  const maxVol = results ? Math.max(1, ...results.hypotheses.map(h=>h.volume||0)) : 1;

  return (
    <div style={s.overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={{ fontFamily:tokens.display||tokens.sans, fontSize:19,
                          fontWeight:600, color:tokens.ink }}>Gap Finder</div>
            <div style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.muted, marginTop:3 }}>
              Discover underserved niches — powered by Claude + {dfsOn ? 'DataForSEO' : 'AI estimates'}
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕ Close</button>
        </div>

        <div style={s.body}>

          {/* Setup */}
          {!results && !loading && (
            <>
              <div style={s.infoBox}>
                Claude profiles the selected metro's demographics and generates 15 underserved service
                categories — niches most rank-and-rent operators overlook.
                {dfsOn
                  ? ' DataForSEO then validates real search volume for each.'
                  : ' Add DataForSEO credentials to validate volume.'}
              </div>

              <label style={s.label}>Select Metro</label>
              <select style={s.select} className="gap-finder-select" value={metro?.id||''} onChange={e => {
                const m = ALL_METROS.find(x => x.id === e.target.value);
                setMetro(m||null);
              }}>
                <option value="">— Choose a metro —</option>
                {ALL_METROS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}, {m.state}</option>
                ))}
              </select>

              {metro && (
                <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
                  {[['Growth', metro.growth], ['Income', metro.income]].map(([l,v]) => (
                    <div key={l} style={{ background:tokens.card, border:`1px solid ${tokens.rule}`,
                                         borderRadius:8, padding:'10px 14px', minWidth:100 }}>
                      <div style={{ fontFamily:tokens.mono, fontSize:9, color:tokens.muted,
                                    letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>{l}</div>
                      <div style={{ fontFamily:tokens.mono, fontSize:18, fontWeight:700,
                                    color: v>=7?tokens.sweet:v>=5?tokens.accent:tokens.muted }}>
                        {v}/10
                      </div>
                    </div>
                  ))}
                  <div style={{ background:tokens.card, border:`1px solid ${tokens.rule}`,
                                 borderRadius:8, padding:'10px 14px' }}>
                    <div style={{ fontFamily:tokens.mono, fontSize:9, color:tokens.muted,
                                  letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Region</div>
                    <div style={{ fontFamily:tokens.mono, fontSize:13, color:tokens.ink2 }}>{metro.region}</div>
                  </div>
                  <div style={{ background:tokens.card, border:`1px solid ${tokens.rule}`,
                                 borderRadius:8, padding:'10px 14px' }}>
                    <div style={{ fontFamily:tokens.mono, fontSize:9, color:tokens.muted,
                                  letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Pop.</div>
                    <div style={{ fontFamily:tokens.mono, fontSize:13, color:tokens.ink2 }}>
                      {(metro.pop||0) >= 1000000
                        ? `${((metro.pop||0)/1000000).toFixed(1)}M`
                        : `${Math.round((metro.pop||0)/1000)}k`}
                    </div>
                  </div>
                </div>
              )}

              <button style={s.runBtn} onClick={findGaps} disabled={!metro || loading}>
                ▶ Find Gap Opportunities
              </button>

              {error && <div style={s.errorBox}>⚠ {error}</div>}
            </>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign:'center', padding:'50px 20px' }}>
              <div style={{ fontSize:26, marginBottom:16,
                            animation:'pulse 1.8s infinite' }}>◈</div>
              <div style={{ fontFamily:tokens.mono, fontSize:12, color:tokens.muted,
                            animation:'pulse 2.2s infinite' }}>{loadMsg}</div>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <>
              <div style={{ display:'flex', alignItems:'center',
                             justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
                <div>
                  <div style={{ fontFamily:tokens.display||tokens.sans, fontSize:16,
                                fontWeight:600, color:tokens.ink }}>
                    {results.hypotheses.length} opportunities — {results.metro.name}, {results.metro.state}
                  </div>
                  <div style={{ fontFamily:tokens.mono, fontSize:10, color:tokens.muted, marginTop:3 }}>
                    {results.dfs_validated ? '⬡ Volume validated by DataForSEO' : '◉ AI estimates — add DataForSEO for volume data'}
                    {' · '}sorted by {results.dfs_validated ? 'search volume' : 'AI ranking'}
                  </div>
                </div>
                <button onClick={() => { setResults(null); setError(null); }}
                  style={{ background:'none', border:`1px solid ${tokens.rule}`, borderRadius:6,
                           padding:'5px 12px', cursor:'pointer', fontFamily:tokens.mono,
                           fontSize:11, color:tokens.muted }}>
                  ← New search
                </button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {results.hypotheses.map((h, i) => (
                  <div key={i} style={{ background:tokens.card, border:`1px solid ${tokens.ruleHi}`,
                                         borderRadius:10, padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start',
                                   justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                      <div style={{ flex:1, minWidth:200 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <span style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.dim }}>
                            {String(i+1).padStart(2,'0')}
                          </span>
                          <span style={{ fontFamily:tokens.sans, fontSize:14, fontWeight:600,
                                         color:tokens.ink }}>{h.name}</span>
                          {h.urgency && urgBadge(h.urgency, tokens)}
                        </div>
                        <div style={{ fontFamily:tokens.mono, fontSize:10, color:tokens.dim,
                                       marginBottom:6 }}>"{h.primary_query}"</div>
                        <div style={{ fontSize:12, color:tokens.ink2, lineHeight:1.6,
                                       marginBottom:6 }}>{h.rationale}</div>
                        <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                          <span style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.muted }}>
                            LTV {h.ltv}
                          </span>
                          <span style={{ fontFamily:tokens.mono, fontSize:11, color:tokens.accent }}>
                            {h.rental_est}/mo est.
                          </span>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column',
                                     alignItems:'flex-end', gap:8, flexShrink:0 }}>
                        {results.dfs_validated && volBar(h.volume, maxVol, tokens)}
                        {h.competition_index != null && (
                          <span style={{ fontFamily:tokens.mono, fontSize:10, color:tokens.dim }}>
                            ci {h.competition_index}
                          </span>
                        )}
                        <button
                          onClick={() => onAnalyze && onAnalyze(results.metro, h.name)}
                          style={{ padding:'6px 14px', borderRadius:6, cursor:'pointer',
                                   fontFamily:tokens.mono, fontSize:10, fontWeight:600,
                                   background:`${tokens.sweet}18`, border:`1px solid ${tokens.sweet}44`,
                                   color:tokens.sweet }}>
                          Analyze →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily:tokens.mono, fontSize:10, color:tokens.dim,
                             marginTop:14, textAlign:'right' }}>
                Generated {new Date(results.generated_at).toLocaleString()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

window.GapFinder = GapFinder;
