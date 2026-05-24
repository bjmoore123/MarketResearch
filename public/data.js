// ═══════════════════════════════════════════════════════════
// SHARED MOCK DATA — Market Intelligence prototype
// ═══════════════════════════════════════════════════════════

window.METROS = [
  // ── Sweet Spot ──
  {id:'phoenix',     name:'Phoenix',                state:'AZ', lat:33.4484, lng:-112.0740, pop:5000000,  demand:9, paying:8, region:'sunbelt',   highlights:['HVAC','Roofing','Pool Service','Pest Control']},
  {id:'dallas',      name:'Dallas–Fort Worth',      state:'TX', lat:32.7767, lng:-96.7970,  pop:7700000,  demand:8, paying:9, region:'texas',     highlights:['Roofing','HVAC','Landscaping','Moving']},
  {id:'atlanta',     name:'Atlanta',                state:'GA', lat:33.7490, lng:-84.3880,  pop:6200000,  demand:8, paying:8, region:'south',     highlights:['HVAC','Roofing','Tree Service']},
  {id:'houston',     name:'Houston',                state:'TX', lat:29.7604, lng:-95.3698,  pop:7300000,  demand:7, paying:8, region:'texas',     highlights:['Roofing','HVAC','Foundation Repair']},
  {id:'nashville',   name:'Nashville',              state:'TN', lat:36.1627, lng:-86.7816,  pop:2100000,  demand:8, paying:8, region:'south',     highlights:['HVAC','Roofing','Landscaping']},
  {id:'charlotte',   name:'Charlotte',              state:'NC', lat:35.2271, lng:-80.8431,  pop:2700000,  demand:8, paying:7, region:'south',     highlights:['HVAC','Roofing','Senior Care']},
  {id:'tampa',       name:'Tampa–St. Pete',         state:'FL', lat:27.9506, lng:-82.4572,  pop:3200000,  demand:7, paying:8, region:'florida',   highlights:['Roofing','Pool Service','Pest Control']},
  {id:'denver',      name:'Denver',                 state:'CO', lat:39.7392, lng:-104.9903, pop:2900000,  demand:7, paying:8, region:'mountain',  highlights:['Roofing','Landscaping','HVAC']},
  {id:'orlando',     name:'Orlando',                state:'FL', lat:28.5383, lng:-81.3792,  pop:2700000,  demand:7, paying:7, region:'florida',   highlights:['Pool Service','Roofing','Pest Control']},
  {id:'austin',      name:'Austin',                 state:'TX', lat:30.2672, lng:-97.7431,  pop:2300000,  demand:8, paying:7, region:'texas',     highlights:['HVAC','Landscaping','Cleaning']},
  {id:'raleigh',     name:'Raleigh–Durham',         state:'NC', lat:35.7796, lng:-78.6382,  pop:1400000,  demand:8, paying:7, region:'south',     highlights:['HVAC','Roofing','Vet Clinics']},
  {id:'saltlake',    name:'Salt Lake City',         state:'UT', lat:40.7608, lng:-111.8910, pop:1250000,  demand:8, paying:7, region:'mountain',  highlights:['Roofing','HVAC','Plumbing']},
  {id:'lasvegas',    name:'Las Vegas',              state:'NV', lat:36.1699, lng:-115.1398, pop:2300000,  demand:7, paying:8, region:'sunbelt',   highlights:['HVAC','Pool Service','Auto Repair']},
  {id:'jacksonville',name:'Jacksonville',           state:'FL', lat:30.3322, lng:-81.6557,  pop:1600000,  demand:7, paying:7, region:'florida',   highlights:['Roofing','HVAC','Tree Service']},
  {id:'capecoral',   name:'Cape Coral–Fort Myers',  state:'FL', lat:26.6406, lng:-81.8723,  pop:800000,   demand:7, paying:7, region:'florida',   highlights:['Roofing','Pool Service','Senior Care']},
  {id:'columbus',    name:'Columbus',               state:'OH', lat:39.9612, lng:-82.9988,  pop:2100000,  demand:6, paying:7, region:'midwest',   highlights:['HVAC','Roofing','Gutters']},
  {id:'indianapolis',name:'Indianapolis',           state:'IN', lat:39.7684, lng:-86.1581,  pop:2100000,  demand:6, paying:7, region:'midwest',   highlights:['HVAC','Roofing','Gutters']},
  {id:'sanantonio',  name:'San Antonio',            state:'TX', lat:29.4241, lng:-98.4936,  pop:2600000,  demand:7, paying:6, region:'texas',     highlights:['HVAC','Roofing','Plumbing']},
  {id:'boise',       name:'Boise',                  state:'ID', lat:43.6150, lng:-116.2023, pop:780000,   demand:8, paying:6, region:'mountain',  highlights:['Roofing','HVAC','Painting']},
  {id:'huntsville',  name:'Huntsville',             state:'AL', lat:34.7304, lng:-86.5861,  pop:480000,   demand:7, paying:6, region:'south',     highlights:['HVAC','Roofing','Landscaping']},
  {id:'greenville',  name:'Greenville',             state:'SC', lat:34.8526, lng:-82.3940,  pop:930000,   demand:7, paying:6, region:'south',     highlights:['HVAC','Roofing','Pest Control']},
  {id:'coloradosp',  name:'Colorado Springs',       state:'CO', lat:38.8339, lng:-104.8214, pop:760000,   demand:6, paying:7, region:'mountain',  highlights:['Roofing','HVAC','Painting']},
  {id:'richmond',    name:'Richmond',               state:'VA', lat:37.5407, lng:-77.4360,  pop:1300000,  demand:6, paying:7, region:'south',     highlights:['HVAC','Roofing','Cleaning']},
  {id:'sarasota',    name:'Sarasota',               state:'FL', lat:27.3364, lng:-82.5307,  pop:850000,   demand:6, paying:7, region:'florida',   highlights:['Pool Service','Roofing','Senior Care']},
  {id:'kansascity',  name:'Kansas City',            state:'MO', lat:39.0997, lng:-94.5786,  pop:2200000,  demand:5, paying:7, region:'midwest',   highlights:['HVAC','Roofing','Landscaping']},
  {id:'knoxville',   name:'Knoxville',              state:'TN', lat:35.9606, lng:-83.9207,  pop:870000,   demand:6, paying:6, region:'south',     highlights:['HVAC','Roofing','Pest Control']},
  {id:'oklahoma',    name:'Oklahoma City',          state:'OK', lat:35.4676, lng:-97.5164,  pop:1400000,  demand:6, paying:6, region:'sunbelt',   highlights:['HVAC','Roofing','Pest Control']},
  {id:'tucson',      name:'Tucson',                 state:'AZ', lat:32.2226, lng:-110.9747, pop:1050000,  demand:6, paying:6, region:'sunbelt',   highlights:['HVAC','Pest Control','Pool Service']},
  {id:'chicago',     name:'Chicago',                state:'IL', lat:41.8781, lng:-87.6298,  pop:9500000,  demand:5, paying:8, region:'midwest',   highlights:['HVAC','Roofing','Cleaning']},
  {id:'miami',       name:'Miami–Fort Lauderdale', state:'FL', lat:25.7617, lng:-80.1918,  pop:6200000,  demand:6, paying:7, region:'florida',   highlights:['Pool Service','Roofing','Pest Control']},
  {id:'dc',          name:'Washington',             state:'DC', lat:38.9072, lng:-77.0369,  pop:6400000,  demand:4, paying:8, region:'northeast', highlights:['HVAC','Landscaping','Senior Care']},
  {id:'boston',      name:'Boston',                 state:'MA', lat:42.3601, lng:-71.0589,  pop:4900000,  demand:4, paying:8, region:'northeast', highlights:['HVAC','Roofing','Cleaning']},
  {id:'minneapolis', name:'Minneapolis–St. Paul',   state:'MN', lat:44.9778, lng:-93.2650,  pop:3700000,  demand:5, paying:7, region:'midwest',   highlights:['HVAC','Roofing','Landscaping']},
  {id:'philadelphia',name:'Philadelphia',           state:'PA', lat:39.9526, lng:-75.1652,  pop:6200000,  demand:4, paying:7, region:'northeast', highlights:['HVAC','Roofing','Cleaning']},
  {id:'seattle',     name:'Seattle',                state:'WA', lat:47.6062, lng:-122.3321, pop:4000000,  demand:4, paying:7, region:'west',      highlights:['Roofing','Landscaping','HVAC']},
  {id:'sandiego',    name:'San Diego',              state:'CA', lat:32.7157, lng:-117.1611, pop:3300000,  demand:4, paying:7, region:'west',      highlights:['HVAC','Pool Service','Pest Control']},
  {id:'losangeles',  name:'Los Angeles',            state:'CA', lat:34.0522, lng:-118.2437, pop:13200000, demand:3, paying:8, region:'west',      highlights:['Pool Service','Cleaning','HVAC']},
  {id:'newyork',     name:'New York',               state:'NY', lat:40.7128, lng:-74.0060,  pop:20000000, demand:3, paying:9, region:'northeast', highlights:['HVAC','Cleaning','Moving']},
  {id:'sanfrancisco',name:'San Francisco',          state:'CA', lat:37.7749, lng:-122.4194, pop:4700000,  demand:2, paying:7, region:'west',      highlights:['Landscaping','Cleaning','HVAC']},
  {id:'detroit',     name:'Detroit',                state:'MI', lat:42.3314, lng:-83.0458,  pop:4400000,  demand:4, paying:6, region:'midwest',   highlights:['HVAC','Roofing','Landscaping']},
  {id:'stlouis',     name:'St. Louis',              state:'MO', lat:38.6270, lng:-90.1994,  pop:2800000,  demand:5, paying:6, region:'midwest',   highlights:['HVAC','Roofing','Pest Control']},
  {id:'pittsburgh',  name:'Pittsburgh',             state:'PA', lat:40.4406, lng:-79.9959,  pop:2400000,  demand:4, paying:6, region:'northeast', highlights:['HVAC','Roofing','Landscaping']},
  {id:'memphis',     name:'Memphis',                state:'TN', lat:35.1495, lng:-90.0490,  pop:1300000,  demand:5, paying:5, region:'south',     highlights:['HVAC','Roofing','Pest Control']},
  {id:'neworleans',  name:'New Orleans',            state:'LA', lat:29.9511, lng:-90.0715,  pop:1270000,  demand:5, paying:5, region:'south',     highlights:['HVAC','Roofing','Foundation Repair']},
  {id:'birmingham',  name:'Birmingham',             state:'AL', lat:33.5186, lng:-86.8104,  pop:1115000,  demand:5, paying:5, region:'south',     highlights:['HVAC','Roofing','Landscaping']},
  {id:'omaha',       name:'Omaha',                  state:'NE', lat:41.2565, lng:-95.9345,  pop:970000,   demand:5, paying:6, region:'midwest',   highlights:['HVAC','Roofing','Gutters']},
  {id:'louisville',  name:'Louisville',             state:'KY', lat:38.2527, lng:-85.7585,  pop:1380000,  demand:5, paying:6, region:'midwest',   highlights:['HVAC','Roofing','Landscaping']},
  {id:'tulsa',       name:'Tulsa',                  state:'OK', lat:36.1540, lng:-95.9928,  pop:1020000,  demand:5, paying:6, region:'sunbelt',   highlights:['HVAC','Roofing','Landscaping']},
  {id:'desmoines',   name:'Des Moines',             state:'IA', lat:41.5868, lng:-93.6250,  pop:700000,   demand:5, paying:6, region:'midwest',   highlights:['HVAC','Roofing','Gutters']},
  {id:'albuquerque', name:'Albuquerque',            state:'NM', lat:35.0844, lng:-106.6504, pop:920000,   demand:5, paying:5, region:'sunbelt',   highlights:['HVAC','Landscaping','Pest Control']},
];

window.NICHE_CATS = [
  { id:'home', label:'Home Services', color:'#c2533f', niches:[
    {id:'hvac',       name:'HVAC Services',    rental:'$500–900',  regions:['everywhere']},
    {id:'roofing',    name:'Roofing',          rental:'$600–1200', regions:['everywhere']},
    {id:'plumbing',   name:'Plumbing',         rental:'$400–700',  regions:['everywhere']},
    {id:'electrical', name:'Electricians',     rental:'$300–600',  regions:['everywhere']},
    {id:'landscape',  name:'Lawn & Landscape', rental:'$400–800',  regions:['south','florida','texas','sunbelt','mountain']},
    {id:'pest',       name:'Pest Control',     rental:'$300–600',  regions:['south','florida','texas','sunbelt']},
    {id:'tree',       name:'Tree Service',     rental:'$400–700',  regions:['everywhere']},
    {id:'gutters',    name:'Gutters',          rental:'$250–500',  regions:['midwest','northeast','south','mountain']},
    {id:'paint',      name:'Painting',         rental:'$400–700',  regions:['everywhere']},
    {id:'waterdamage',name:'Water Damage',     rental:'$600–1000', regions:['everywhere']},
    {id:'foundation', name:'Foundation Repair',rental:'$500–900',  regions:['south','texas','midwest']},
    {id:'pool',       name:'Pool Service',     rental:'$400–800',  regions:['florida','sunbelt','texas']},
  ]},
  { id:'health', label:'Health & Wellness', color:'#3a6b8f', niches:[
    {id:'dentist', name:'General Dentistry',     rental:'$600–1200', regions:['everywhere']},
    {id:'ortho',   name:'Orthodontists',         rental:'$700–1400', regions:['south','texas','mountain','sunbelt']},
    {id:'chiro',   name:'Chiropractors',         rental:'$400–800',  regions:['everywhere']},
    {id:'pt',      name:'Physical Therapy',      rental:'$400–700',  regions:['everywhere']},
    {id:'medspa',  name:'Med Spa & Aesthetics',  rental:'$600–1200', regions:['south','florida','texas','sunbelt','mountain']},
    {id:'mental',  name:'Mental Health',         rental:'$400–800',  regions:['everywhere']},
    {id:'senior',  name:'Senior / Home Health',  rental:'$700–1500', regions:['florida','sunbelt','south']},
    {id:'iv',      name:'IV Therapy',            rental:'$400–700',  regions:['south','florida','texas','sunbelt']},
  ]},
  { id:'personal', label:'Personal Care', color:'#7a5fa3', niches:[
    {id:'hair',    name:'Hair Salons',         rental:'$200–400', regions:['everywhere']},
    {id:'nail',    name:'Nail Salons',         rental:'$200–350', regions:['everywhere']},
    {id:'massage', name:'Massage Therapy',     rental:'$300–500', regions:['everywhere']},
    {id:'gym',     name:'Gyms & Fitness',      rental:'$400–700', regions:['south','texas','mountain','sunbelt']},
    {id:'cleaning',name:'House Cleaning',      rental:'$400–700', regions:['everywhere']},
  ]},
  { id:'pet', label:'Pet Services', color:'#3d8567', niches:[
    {id:'vet',     name:'Veterinary',         rental:'$500–900', regions:['everywhere']},
    {id:'grooming',name:'Dog Grooming',       rental:'$250–450', regions:['south','texas','mountain','sunbelt']},
    {id:'training',name:'Dog Training',       rental:'$300–500', regions:['south','texas','mountain','sunbelt']},
    {id:'board',   name:'Boarding & Daycare', rental:'$300–500', regions:['everywhere']},
  ]},
  { id:'legal', label:'Legal & Financial', color:'#b08a3e', niches:[
    {id:'injury',    name:'Personal Injury',  rental:'$800–2000', regions:['everywhere']},
    {id:'divorce',   name:'Family Law',       rental:'$600–1400', regions:['everywhere']},
    {id:'dui',       name:'DUI / Criminal',   rental:'$600–1200', regions:['everywhere']},
    {id:'bankruptcy',name:'Bankruptcy',       rental:'$400–800',  regions:['everywhere']},
    {id:'estate',    name:'Estate Planning',  rental:'$500–1000', regions:['florida','sunbelt','south','northeast']},
    {id:'insurance', name:'Insurance Agents', rental:'$400–700',  regions:['everywhere']},
  ]},
  { id:'auto', label:'Auto Services', color:'#c97a3f', niches:[
    {id:'autorepair',name:'Auto Repair',      rental:'$300–600', regions:['everywhere']},
    {id:'detailing', name:'Auto Detailing',   rental:'$200–400', regions:['south','florida','texas','sunbelt']},
    {id:'windshield',name:'Windshield',       rental:'$200–400', regions:['everywhere']},
    {id:'locksmith', name:'Locksmith',        rental:'$200–400', regions:['everywhere']},
    {id:'towing',    name:'Towing',           rental:'$300–600', regions:['everywhere']},
  ]},
];

// ─── Utilities ──────────────────────────────────────────────
window.MIutil = {
  quadrant(d, p) {
    if (d >= 7 && p >= 7) return { key:'sweet',  color:'#2f8f6a', label:'Sweet Spot' };
    if (d >= 7 && p <  7) return { key:'demand', color:'#3a6b8f', label:'Demand Rich' };
    if (d <  7 && p >= 7) return { key:'comp',   color:'#b08a3e', label:'Competitive' };
    return { key:'watch', color:'#888a90', label:'Watch List' };
  },
  // Project lat/lng to an approximate albers-ish pixel coord inside W×H box, fitting continental US.
  // Returns {x,y} as fraction 0..1 of the box.
  projectLL(lat, lng) {
    // simple equirect projection bounded to continental US window
    const minLng = -125, maxLng = -66.5;
    const minLat = 24,   maxLat = 50;
    const x = (lng - minLng) / (maxLng - minLng);
    // approximate Albers curvature with a small lat-dependent y-tweak
    const yLin = 1 - (lat - minLat) / (maxLat - minLat);
    return { x, y: yLin };
  },
  niches() { return window.NICHE_CATS.flatMap(c => c.niches.map(n => ({ ...n, cat: c }))); },
  isStrong(niche, metro) { return niche.regions.includes('everywhere') || niche.regions.includes(metro.region); },
  comboScore(metro, niche) {
    const market = (metro.demand + metro.paying) / 2;
    const strong = (niche.regions.includes('everywhere') || niche.regions.includes(metro.region)) && metro.demand >= 6;
    return parseFloat((market * (strong ? 1.0 : 0.6)).toFixed(2));
  },
  buildCombos() {
    const out = [];
    window.METROS.forEach(m => window.NICHE_CATS.forEach(cat => cat.niches.forEach(n => {
      const score = this.comboScore(m, n);
      const strong = this.isStrong(n, m) && m.demand >= 6;
      out.push({ metro: m, cat, niche: n, score, strong });
    })));
    return out.sort((a,b) => b.score - a.score);
  },
};

// ─── Mock deep-analysis payload ────────────────────────────
window.mockAnalysis = function(metro, niche) {
  const market = (metro.demand + metro.paying) / 2;
  const strong = window.MIutil.isStrong(niche, metro) && metro.demand >= 6;
  const baseScore = market * (strong ? 1.0 : 0.7);
  // four-phase
  const phases = {
    geo:    Math.min(10, Math.round(baseScore + (metro.pop > 2000000 ? 0.6 : 0))),
    demand: Math.min(10, Math.round(metro.demand + (strong ? 1 : -1))),
    comp:   Math.min(10, Math.round(metro.paying + (metro.demand > 7 ? 0 : -1))),
    opp:    Math.min(10, Math.round(baseScore + (strong ? 0.4 : -0.7))),
  };
  const wt = (phases.geo*0.2 + phases.demand*0.3 + phases.comp*0.25 + phases.opp*0.25).toFixed(2);
  const dec = wt >= 8 ? 'strong_go' : wt >= 6 ? 'conditional_go' : wt >= 4 ? 'hold' : 'no_go';
  return {
    metro, niche,
    primary_query: `best ${niche.name.toLowerCase()} in ${metro.name.toLowerCase()}`,
    phases, wt, decision: dec,
    volume: strong ? 1200 + Math.floor(Math.random()*1800) : 200 + Math.floor(Math.random()*600),
    kd: strong ? 22 + Math.floor(Math.random()*18) : 35 + Math.floor(Math.random()*30),
    cpc: (8 + Math.random()*22).toFixed(2),
    seasonal: ['hvac','roofing','pool','landscape','tree','pest'].includes(niche.id),
    median_income: ['$58k','$64k','$72k','$81k','$67k'][Math.floor(Math.random()*5)],
    migration: ['+1.2% YoY','+2.4% YoY','+3.1% YoY','+0.8% YoY','+1.9% YoY'][Math.floor(Math.random()*5)],
    serp_strength: strong ? 'Weak' : 'Medium',
    avg_dr: strong ? 18 + Math.floor(Math.random()*10) : 32 + Math.floor(Math.random()*18),
    aggregators: 3 + Math.floor(Math.random()*4),
    beatable: strong ? 4 + Math.floor(Math.random()*3) : 1 + Math.floor(Math.random()*2),
    rank_rent_detected: !strong && Math.random() > 0.6,
    rank_time: strong ? `${3 + Math.floor(Math.random()*3)} mo` : `${6 + Math.floor(Math.random()*5)} mo`,
    rental: niche.rental,
    ltv: strong ? `$${(3.2 + Math.random()*4.5).toFixed(1)}k` : `$${(1.8 + Math.random()*2).toFixed(1)}k`,
    receptivity: strong ? 'High' : 'Medium',
    summary: strong
      ? `${metro.name} has the rare combination of underserved buyers (${metro.demand}/10) and high willingness-to-pay (${metro.paying}/10). The SERP is dominated by aggregators with average Domain Rank ${18 + Math.floor(Math.random()*10)} — a focused content + local-citation play should clear the top three positions inside one quarter. ${niche.name} services align with the region's economic drivers and inbound migration is sustaining demand. Recommended opening rental ${niche.rental}/mo with one anchor client, expand to a two-client rotation by month four.`
      : `${metro.name} is a mature ${niche.name.toLowerCase()} market with established lead-buying infrastructure but lower underserved demand (${metro.demand}/10). SERP shows entrenched domains and possible rank-rent competitors already operating. Worth monitoring but not the first move — revisit if demand signals improve or a directly competing aggregator weakens.`,
    strongest_signal: strong
      ? `Top 3 SERP positions held by aggregators with Domain Rank under 25 — directly beatable.`
      : `Stable demand baseline with mature lead-buying market — durable if entered.`,
    biggest_risk: strong
      ? `Seasonal demand curve concentrates revenue in Q2–Q3; off-season cashflow needs planning.`
      : `Established competitors have 3+ years of local backlinks and brand search.`,
    first_action: strong
      ? `Register domain matching primary query, publish 12 cornerstone pages targeting metro + service modifiers within 30 days.`
      : `Monitor weekly SERP movement for the next 60 days before committing capital.`,
    queries: [
      { q: `best ${niche.name.toLowerCase()} in ${metro.name.toLowerCase()}`, vol: 1900, kd: 24, cpc: 12.40, src:'live' },
      { q: `top ${niche.name.toLowerCase()} ${metro.name.toLowerCase()}`,     vol: 880,  kd: 28, cpc: 11.20, src:'live' },
      { q: `${niche.name.toLowerCase()} near ${metro.name.toLowerCase()}`,    vol: 1300, kd: 31, cpc: 9.80,  src:'live' },
      { q: `affordable ${niche.name.toLowerCase()} ${metro.name.toLowerCase()}`, vol: 320, kd: 19, cpc: 10.10, src:'live' },
    ],
    serp: [
      { pos:1, domain:'yelp.com',            dr:91, backlinks: 4200000, type:'aggregator' },
      { pos:2, domain:'angi.com',            dr:84, backlinks: 1100000, type:'aggregator' },
      { pos:3, domain:`${niche.id}-${metro.id}.com`, dr:14, backlinks: 220, type:'rank-rent' },
      { pos:4, domain:'thumbtack.com',       dr:78, backlinks: 980000,  type:'aggregator' },
      { pos:5, domain:`top-${niche.id}-${metro.id.slice(0,4)}.com`, dr:11, backlinks: 84,  type:'beatable' },
      { pos:6, domain:'homeadvisor.com',     dr:81, backlinks: 1500000, type:'aggregator' },
      { pos:7, domain:`${metro.id}-${niche.id}-pros.com`, dr:9,  backlinks: 48, type:'beatable' },
      { pos:8, domain:'bbb.org',             dr:88, backlinks: 2200000, type:'aggregator' },
      { pos:9, domain:`${niche.id}near${metro.id}.com`,   dr:13, backlinks: 110, type:'rank-rent' },
      { pos:10,domain:`local${niche.id}.com`,             dr:7,  backlinks: 22,  type:'beatable' },
    ],
  };
};
