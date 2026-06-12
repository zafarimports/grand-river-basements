# Grand River Basements — website

A fast, static website with a free cost calculator, an estimate wizard, a call-back
scheduler, and full local SEO. It costs almost nothing to run no matter how busy it gets.

---

## What's in here

```
site.config.json          ← the ONE file you edit per site (name, phone, area, links)
build.js                  ← run this to (re)build the website
src/
  template.html           ← the page layout (edit wording/sections here)
  styles.css              ← the design
  app.js                  ← calculator, wizard, calendar + where lead data is sent
supabase/
  schema.sql              ← the database table for leads
  functions/notify-lead/  ← emails/texts the client when a lead comes in
dist/                     ← the finished website (created by build.js — this is what you upload)
```

## How to build the site

In a terminal, from this folder:

```
node build.js
```

That regenerates the `dist/` folder: the homepage plus a page for each city, the sitemap,
and robots.txt. **Always run this after editing the config or the template.**

## How to edit common things

- **Business name, phone, email, cities, domain** → `site.config.json`
- **Real prices in the calculator** → top of `src/app.js` (`COST_PSF`, `FLAT`, `RENT`, `RANGES`)
- **Photos** → replace the dashed placeholder blocks in `src/template.html` with `<img>` tags
- **Reviews / wording** → `src/template.html`

---

## Step 1 — Put it online (pick one)

### Option A (recommended): Cloudflare Pages — free, fast, auto-updates
1. Put this folder on GitHub (Claude Code can do this for you).
2. Go to **Cloudflare → Workers & Pages → Create → Pages → connect your GitHub repo**.
3. Build settings: **Build command** `node build.js`, **Output directory** `dist`.
4. Deploy. You get a free `*.pages.dev` link.
5. Add your domain in Cloudflare Pages → it gives you the DNS records to point it.

Cost: **$0**, even with lots of traffic. Every time the repo changes, the site rebuilds itself.

### Option B: Hostinger (use the plan you already have)
1. Run `node build.js` on your computer.
2. Upload **everything inside `dist/`** to `public_html` (Hostinger file manager or FTP).
3. Point your domain in Hostinger. Done. (To update later, rebuild and re-upload `dist/`.)

---

## Step 2 — Make the lead alerts work (Supabase + email, free)

1. Create a free project at **supabase.com**.
2. **SQL Editor** → paste `supabase/schema.sql` → Run (creates the leads table).
3. Install the Supabase CLI and deploy the function (Claude Code can run these):
   ```
   supabase functions deploy notify-lead --no-verify-jwt
   ```
4. In **Edge Functions → Secrets**, add:
   - `RESEND_API_KEY` (from resend.com — free email)
   - `FROM_EMAIL` (a verified sender, e.g. leads@yourdomain.ca)
   - `NOTIFY_EMAIL` (the client's email to alert)
5. Copy the function's URL and paste it into `site.config.json` →
   `integrations.leadEndpoint`, then `node build.js` and redeploy.

Now every estimate request is saved AND emails the client instantly. **Cost: free.**

### Optional — also text the client (~CA$2/month)
Add these secrets too: `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`, `NOTIFY_PHONE`.
A Twilio number is ~CA$2/month plus about 1¢ per text. Leave them out to stay 100% free.

---

## Step 3 — Make the calendar real (Cal.com → Google/iPhone calendar)

The page currently shows a working **demo** calendar so you can see the flow. To make it
book real time slots on the client's calendar:

1. Create a free **Cal.com** account; connect the client's **Google or Apple calendar**.
2. Make an event type called "Estimate call-back", set the days/times the client is free.
3. Replace the demo calendar block (`<div id="calWrap">…</div>` in `src/template.html`)
   with Cal.com's inline embed:
   ```html
   <div style="width:100%;height:560px" id="my-cal"></div>
   <script type="text/javascript">
     (function (C, A, L) { /* Cal.com embed snippet from your Cal dashboard */ })(window, "https://app.cal.com/embed/embed.js", "init");
     Cal("inline", { elementOrSelector: "#my-cal", calLink: "YOUR-CALCOM-LINK" });
   </script>
   ```
Now only the client's truly-free times show, and booked call-backs land on their calendar automatically.

---

## Step 4 — Tell Google about the site
1. Add the site in **Google Search Console** and **Bing Webmaster Tools**.
2. Submit `https://yourdomain.ca/sitemap.xml`.
3. (Biggest win) Set up the **Google Business Profile** and start collecting reviews.

---

## Building the SECOND site (renovation brand)
1. Copy this whole folder, rename it.
2. Edit `site.config.json` (new brand, domain, etc.) and adjust the wording/services in
   `src/template.html` for the renovation niche.
3. `node build.js` → deploy the same way. Same engine, second brand.
