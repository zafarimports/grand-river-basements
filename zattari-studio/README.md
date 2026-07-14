# ZATTARI — Growth Systems Studio

Award-style animated landing page + full trial funnel for digital marketing,
automation and lead-generation services.

**Stack:** one hand-built static page. No frameworks, no build step.
Open `index.html` — that's the whole site.

## What's inside

```
index.html        The site: SEO, animations, popups, checkout funnel — all inline
logo.svg          The Signal-Z logo (also inlined in the page + favicon)
assets/           Case-study photography (Grand River Basements) + og.png
emails/           6-email trial automation sequence + wiring blueprint
```

## Advanced techniques used (the showcase list)

1. **Generative flow-field canvas** — hero particles ride a pseudo-noise
   vector field with rightward drift: traffic converging into a pipeline.
2. **Scroll-choreographed animation system** — IntersectionObserver reveals,
   scroll-linked process rail, count-up stats, staggered split-text headline.
3. **SVG stroke-draw intro** — the logo draws itself, then the page unveils
   via animated `clip-path`.
4. **Custom cursor + magnetic buttons** — lerped trailing ring, hover-aware,
   pointer-fine only.
5. **Draggable before/after comparator** — Pointer Events + CSS `clip-path`,
   touch-friendly.
6. **State-machine checkout funnel** — 3-step modal with validation,
   localStorage persistence, exit-intent + scroll-depth popups with
   frequency capping, confetti success state.

Everything respects `prefers-reduced-motion` and degrades cleanly on touch.

## Go live (10 minutes)

1. Upload the folder to any static host (Hostinger `public_html/`, Netlify,
   Vercel, GitHub Pages).
2. Point your domain; update `<link rel="canonical">` and the `og:` URLs in
   `index.html` to the real domain.

## Wire the money (30 minutes)

Open `index.html`, find the `CONFIG` object at the top of the `<script>`:

- `LEAD_ENDPOINT` — a Supabase Edge Function URL (copy `notify-lead` from
  the grand-river-basements repo). Until set, submissions fall back to a
  pre-filled email to `CONTACT_EMAIL`, so the funnel works on day one.
- `STRIPE_LINKS` — create three Stripe Payment Links, each on a monthly
  price with a **7-day free trial**. Stripe then owns card capture,
  invoicing, dunning and cancellations — no checkout code to maintain.
- Emails: see `emails/README.md` for the day-by-day automation blueprint.

## Fastest way to sell this (the playbook)

Sell the trial, not the retainer — "I'll build it free this week" closes
itself. In order of speed-to-first-dollar:

1. **Walk the proof (days, not weeks).** Screen-record grandriverbasement.ca
   + this page. DM 20 local service businesses/day (roofers, landscapers,
   clinics, gyms) on Instagram/Facebook with a 90-second Loom of *their*
   site's leaks. Offer the free week. 100 DMs ≈ 5–10 trials ≈ 2–4 paying.
2. **Google Maps mining.** Businesses with 4.5★+ reviews and terrible/no
   websites are pre-qualified — they're good at the work, bad at capture.
   Call them; the pitch writes itself.
3. **Local Facebook groups & BNI/chamber meetups** in Waterloo Region —
   "I build lead machines, first week free, here's one live" is a
   walk-in-the-door offer.
4. **One niche, then clone.** After 2 basement/reno clients, the case study
   sells vertical #3 by itself. Riches in niches: "reno lead systems"
   beats "digital marketing".
5. **Later:** productize on Upwork/Fiverr Pro for volume, and run this page
   itself as the ad landing page (it's built for it — popups, funnel,
   trial CTA everywhere).
