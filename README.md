# Grand River Basements — website

Editorial marketing site for Grand River Basements (basement renovations in Cambridge, Kitchener, Waterloo, Guelph, Paris — Ontario).

**Live:** https://grandriverbasement.ca

## Stack

- Static HTML/CSS/JS — no framework
- Build: `node build.js` reads `site.config.json` + `src/template.html` and writes `dist/`
- Lead capture: Supabase Edge Function (`supabase/functions/notify-lead/`)
- Booking: Cal.com inline embed (`calcomUrl` in config)
- Email alerts: Resend → `info@grandriverbasement.ca`
- Hosting: Hostinger (static, uploaded by FTP)

## Develop locally

```bash
cd grand-river-basements
node build.js                       # write /dist
cd dist && python -m http.server 8723
# open http://localhost:8723
```

Edit `src/template.html`, `src/styles.css`, `src/app.js`, or `site.config.json`. Re-run `node build.js`.

## Deploy

Upload everything in `grand-river-basements/dist/` to Hostinger `public_html/` via FTP.

## Project structure

```
grand-river-basements/
├── site.config.json     # brand, phone, email, cities, integrations
├── build.js             # template renderer
├── src/                 # source: template, styles, app, photo assets
├── supabase/            # database schema + Edge Function for lead capture
└── dist/                # built site (gitignored)
Project Photos/          # source basement project photos
Logo*                    # source logo assets (not used on live site)
```
