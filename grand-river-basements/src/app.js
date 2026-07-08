/* ============================================================
   Grand River Basements — front-end logic
   Reads runtime config from window.SITE (set in the page <head>)
   ============================================================ */
const SITE = window.SITE || {};

/* ---------- reveal on scroll ---------- */
const obs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ---------- COST CALCULATOR (edit numbers to client's real pricing) ----------
   Calibrated to 2026 Ontario / Grand River region averages.
   Formula: base = size × COST_PSF[finish] × (1 + TYPE_MULT[type])
            range shown = [base × 0.9, base × 1.2]
*/
const COST_PSF = { basic: 65, standard: 92, premium: 140 };       // $ per sq ft by finish
const TYPE_MULT = { apartment: 0.35, reno: 0.0, addition: -0.5 }; // apartment adds 35% for kitchen/egress/sound separation
const FLAT = { bath: [15000, 28000], water: [7000, 22000] };      // flat ranges (size-independent)
const RENT = { Cambridge: 1850, Kitchener: 1850, Waterloo: 1950, Guelph: 1800, Paris: 1700 };
let cState = { type: 'apartment', size: 600, finish: 'standard', city: 'Cambridge' };
const roundK = n => '$' + (Math.round(n / 1000) * 1000).toLocaleString();
function calc() {
  const o = document.getElementById('oCost'); if (!o) return;
  const incWrap = document.getElementById('oIncomeWrap');
  let lo, hi;
  if (FLAT[cState.type]) { [lo, hi] = FLAT[cState.type]; }
  else {
    const base = cState.size * COST_PSF[cState.finish] * (1 + TYPE_MULT[cState.type]);
    lo = base * 0.9; hi = base * 1.2;
  }
  o.textContent = roundK(lo) + ' – ' + roundK(hi);
  if (cState.type === 'apartment') {
    incWrap.style.display = 'grid';
    const rent = RENT[cState.city] || 1700;
    const payback = ((lo + hi) / 2) / (rent * 12);
    document.getElementById('oRent').textContent = '$' + rent.toLocaleString() + '/mo';
    document.getElementById('oPayback').textContent = '~' + payback.toFixed(1) + ' yrs';
  } else { incWrap.style.display = 'none'; }
}
function bindPills(id, prop, attr) {
  document.querySelectorAll('#' + id + ' .pill').forEach(p => p.addEventListener('click', () => {
    document.querySelectorAll('#' + id + ' .pill').forEach(x => x.classList.remove('on'));
    p.classList.add('on'); cState[prop] = p.dataset[attr]; calc();
  }));
}
bindPills('cType', 'type', 'k'); bindPills('cFinish', 'finish', 'f'); bindPills('cCity', 'city', 'c');
const cSize = document.getElementById('cSize');
if (cSize) cSize.addEventListener('input', e => { cState.size = +e.target.value; document.getElementById('cSizeV').textContent = e.target.value; calc(); });
calc();

/* ---------- BEFORE / AFTER slider ---------- */
const baRange = document.getElementById('baRange');
if (baRange) {
  const baBefore = document.getElementById('baBefore');
  const baHandle = document.getElementById('baHandle');
  const baKnob = document.getElementById('baKnob');
  const apply = v => {
    baBefore.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
    baHandle.style.left = v + '%';
    if (baKnob) baKnob.style.left = v + '%';
  };
  baRange.addEventListener('input', e => apply(e.target.value));
  apply(baRange.value); // initialise to current value (default 50)
}

/* ---------- ESTIMATE WIZARD ---------- */
const RANGES = {
  apartment: { label: "Legal basement apartment", range: "$55,000 – $110,000" },
  reno: { label: "Full basement renovation", range: "$30,000 – $75,000" },
  addition: { label: "Basement upgrades / additions", range: "$10,000 – $35,000" },
  bath: { label: "Basement bathroom", range: "$15,000 – $28,000" },
  water: { label: "Waterproofing", range: "$7,000 – $22,000" },
  unsure: { label: "Your basement project", range: "We'll prepare a custom quote" }
};
const st = { service: null, serviceKey: null, city: null, stateOf: null, timeline: null, budget: null };
let step = 1; const TOTAL = 4;
const segs = document.querySelectorAll('.progress .seg');
const btnNext = document.getElementById('btnNext'), btnBack = document.getElementById('btnBack');

document.querySelectorAll('.opts').forEach(group => {
  const key = group.dataset.group;
  group.querySelectorAll('.opt').forEach(opt => opt.addEventListener('click', () => {
    group.querySelectorAll('.opt').forEach(o => o.classList.remove('sel'));
    opt.classList.add('sel');
    if (key === 'service') { st.service = opt.dataset.val; st.serviceKey = opt.dataset.key; }
    else st[key === 'state' ? 'stateOf' : key] = opt.dataset.val;
  }));
});
function showStep(n) {
  document.querySelectorAll('.wz-step').forEach(s => s.classList.toggle('active', +s.dataset.step === n));
  segs.forEach((sg, i) => sg.classList.toggle('done', i < n));
  btnBack.classList.toggle('show', n > 1);
  btnNext.textContent = n === TOTAL ? 'Get my estimate →' : 'Continue →';
}
function valid(n) {
  if (n === 1) return !!st.service;
  if (n === 2) return !!st.city && !!st.stateOf;
  if (n === 3) return !!st.timeline && !!st.budget;
  if (n === 4) return document.getElementById('f_name').value && document.getElementById('f_phone').value && document.getElementById('f_addr').value;
  return true;
}
if (btnNext) {
  btnNext.addEventListener('click', () => {
    if (!valid(step)) { btnNext.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); return; }
    if (step < TOTAL) { step++; showStep(step); scrollToWizard(); }
    else finish();
  });
  btnBack.addEventListener('click', () => { if (step > 1) { step--; showStep(step); } });
}
function scrollToWizard() { document.getElementById('estimate').scrollIntoView({ behavior: 'smooth', block: 'start' }); }

async function finish() {
  // 1) show ballpark + note + calendar
  const r = RANGES[st.serviceKey] || RANGES.unsure;
  document.getElementById('rService').textContent = r.label + (st.city ? (' · ' + st.city) : '');
  document.getElementById('rRange').textContent = r.range;
  document.getElementById('wzForm').style.display = 'none';
  document.getElementById('wzResult').classList.add('show');
  scrollToWizard();
  initCalEmbed(); // load live Cal.com calendar (syncs with client's Google/Apple calendar)

  // 2) send the lead (name, phone, address, email, all answers) to the client
  const payload = {
    name: document.getElementById('f_name').value,
    phone: document.getElementById('f_phone').value,
    address: document.getElementById('f_addr').value,
    email: document.getElementById('f_email').value,
    notes: document.getElementById('f_notes').value,
    service: st.service, current_state: st.stateOf, city: st.city,
    timeline: st.timeline, budget: st.budget,
    ballpark: r.range, source: 'website-estimate', created_at: new Date().toISOString()
  };
  submitLead(payload);
}

async function submitLead(payload) {
  const endpoint = SITE.leadEndpoint;
  if (!endpoint || endpoint.indexOf('REPLACE') !== -1) {
    console.log('[demo] lead captured (no endpoint configured):', payload);
    return; // demo mode — prototype shows the flow without a live backend
  }
  try {
    await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (e) { console.error('Lead submit failed:', e); }
}

/* ---------- CALL-BACK BOOKING — Cal.com (syncs live with client's Google/Apple calendar) ----------
   Called once the user sees their ballpark. Loads Cal.com's embed and renders their
   real availability into #cal-embed. Only slots the client has opened will appear. */
function initCalEmbed() {
  const calLink = (SITE.calcom && SITE.calcom.indexOf('REPLACE') === -1)
    ? SITE.calcom
    : 'grandriverbasements/free-estimate-consultation'; // fallback while config not yet set

  // If already initialised (user re-opens result), just exit
  if (window._calLoaded) return;
  window._calLoaded = true;

  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal; let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {}; cal.q = cal.q || [];
        d.head.appendChild(d.createElement('script')).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1]; api.q = api.q || [];
        typeof namespace === 'string' ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  Cal('init', { origin: 'https://cal.com' });
  Cal('inline', {
    elementOrSelector: '#cal-embed',
    calLink: calLink,
    layout: 'month_view'
  });
  Cal('ui', {
    styles: { branding: { brandColor: '#B5512A' } },
    hideEventTypeDetails: true,
    layout: 'month_view'
  });
}

/* ---------- FAQ ---------- */
document.querySelectorAll('.qa button').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));

/* ---------- CITY CAROUSEL (drag + auto-scroll, seamless loop) ---------- */
const ccTrack = document.getElementById('ccTrack');
if (ccTrack) {
  let dragging = false, hover = false, startX = 0, startScroll = 0;
  ccTrack.addEventListener('pointerdown', e => {
    dragging = true; startX = e.clientX; startScroll = ccTrack.scrollLeft;
    ccTrack.setPointerCapture && ccTrack.setPointerCapture(e.pointerId);
  });
  ccTrack.addEventListener('pointermove', e => { if (dragging) ccTrack.scrollLeft = startScroll - (e.clientX - startX); });
  ccTrack.addEventListener('pointerup', () => { dragging = false; });
  ccTrack.addEventListener('pointerleave', () => { dragging = false; });
  ccTrack.addEventListener('mouseenter', () => { hover = true; });
  ccTrack.addEventListener('mouseleave', () => { hover = false; });

  const ccPrev = document.getElementById('ccPrev'), ccNext = document.getElementById('ccNext');
  if (ccPrev) ccPrev.addEventListener('click', () => ccTrack.scrollBy({ left: -340, behavior: 'smooth' }));
  if (ccNext) ccNext.addEventListener('click', () => ccTrack.scrollBy({ left: 340, behavior: 'smooth' }));

  setInterval(() => {
    if (hover || dragging) return;
    ccTrack.scrollLeft += 1.4;
    const half = ccTrack.scrollWidth / 2;
    if (ccTrack.scrollLeft >= half) ccTrack.scrollLeft -= half;
  }, 30);
}

/* ---------- MOBILE NAV ---------- */
const navToggle = document.getElementById('navToggle');
const navDrawer = document.getElementById('navDrawer');
function closeNav(){ document.documentElement.classList.remove('nav-open'); }
if (navToggle) navToggle.addEventListener('click', () => {
  const open = document.documentElement.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (navDrawer) navDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
});
if (navDrawer) navDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
const navScrim = document.querySelector('.nav-scrim');
if (navScrim) navScrim.addEventListener('click', closeNav);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
