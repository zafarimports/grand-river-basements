# Grandriver Coatings — website

Premium polyaspartic **flake floor coating** company site for the Grand River region
(Kitchener, Waterloo, Cambridge, Paris, Brantford, Milton, London, Guelph, Elmira, Hamilton).

This is the **design/preview build**: one self-contained `index.html` you can open directly,
with a working flake **visualizer**, a one-question-at-a-time **estimator**, and a
10-second free-estimate **popup**. It's the look + behaviour to approve before converting to
the production Next.js + Supabase + Vercel stack.

## Run it

```bash
cd grandriver-coatings
python3 -m http.server 8777
# open http://localhost:8777
```

Open `index.html` directly in a browser too — everything runs client-side.

## Structure

```
grandriver-coatings/
├── index.html               # the whole site (HTML + CSS + JS)
├── logo/
│   ├── logo-full.svg        # full-colour wordmark — for light backgrounds (invoices, letterhead)
│   ├── logo-white.svg       # white wordmark — used on the dark site, truck wrap, social
│   └── mark.svg             # square "G" emblem — favicon / avatar
├── assets/                  # generated photos land here (see below) — empty until generated
└── scripts/
    └── generate-assets.mjs  # optional: generate logo + before/after photos with Gemini
```

All logos are **SVG**, so they drag straight into Figma and stay razor-sharp at any size.
Install the free **Archivo** font (Google Fonts) so the wordmark text matches.

## Features built in

- **Flake visualizer** — pick a *Signature* or *Torginol®* blend, toggle individual flake
  chips (real Torginol names + codes on hover), change the base coat, **or upload a photo of
  your own floor** and preview the flakes broadcast over it. Also links out to Torginol's own
  visualizer (`torginol.com/design`) as a fallback.
- **Estimator** — one question at a time (area → condition → moisture → contact) with a live
  price. Rule: **$8/sq ft** base, **+$1** if cracks/damage, **+$1** if moisture → capped at **$10/sq ft**.
- **10-second popup** — offers a free estimate ~10s after load, once per browser session.

## Generating real before/after photos (optional, Gemini)

`scripts/generate-assets.mjs` calls a Gemini image model to produce a hero floor, before/after
panels, and a raster logo into `assets/`.

```bash
GEMINI_API_KEY=your_key node scripts/generate-assets.mjs
```

> **Status:** the key shared earlier is valid but its Google account has **no image-generation
> quota** (the API returns HTTP 429 "check your plan and billing"). Enable billing on the
> Google AI Studio / Cloud project, then run the script. Until then the site uses the built-in
> rendered flake floors as polished placeholders.
>
> **Security:** never hardcode or commit the key — the script reads it from `GEMINI_API_KEY`
> only. **Rotate/delete the key in Google AI Studio**, since it was pasted into a chat.
>
> **Honesty note:** AI-generated "before/after" images should be labelled as illustrations,
> or replaced with real job photos, so customers aren't misled.

## Still to wire (production phase)

- Convert to **Next.js**, deploy on **Vercel**.
- **Supabase** table + Edge Function to save each estimate (name, email, phone, address,
  answers, price) and email the office + customer.
- **Cal.com** inline embed for the "Book free consultation" button.
- Real **phone number** (the placeholder `(647) 313-0000` is only a stand-in — the number
  given was 9 digits).
- Replace placeholder floors with real job photos (or generated assets once billing is on).
