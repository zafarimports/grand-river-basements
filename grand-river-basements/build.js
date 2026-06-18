#!/usr/bin/env node
/* Build the static site from site.config.json + src/template.html
   Usage: node build.js   ->   outputs everything into /dist  */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const template = fs.readFileSync(path.join(ROOT, 'src', 'template.html'), 'utf8');
const DIST = path.join(ROOT, 'dist');
const BUILD_ID = Date.now().toString(36); // cache-busts /styles.css and /app.js per build

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "name": cfg.brand,
    "url": cfg.domain + "/",
    "telephone": "+1-" + cfg.phoneTel.replace(/^1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'),
    "priceRange": "$$",
    "image": cfg.domain + "/og-image.jpg",
    "address": { "@type": "PostalAddress", "streetAddress": cfg.address.street, "addressLocality": cfg.address.city, "addressRegion": cfg.address.region, "postalCode": cfg.address.postal, "addressCountry": "CA" },
    "geo": { "@type": "GeoCoordinates", "latitude": cfg.geo.lat, "longitude": cfg.geo.lng },
    "areaServed": cfg.cities.map(c => c.name + " ON"),
    "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "08:00", "closes": "18:00" }],
    "hasOfferCatalog": { "@type": "OfferCatalog", "name": "Basement Services", "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Legal Basement Apartments" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Basement Bathrooms" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Basement Renovations & Additions" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Basement Waterproofing" } }
    ] }
  };
}
function faqJsonLd(areaName) {
  return {
    "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
      { "@type": "Question", "name": "Do you handle permits and architectural drawings?", "acceptedAnswer": { "@type": "Answer", "text": "We build basements to current Ontario code. Architectural drawings and permit applications are arranged separately by the homeowner — we're glad to point you to a designer we trust." } },
      { "@type": "Question", "name": "How much does a legal basement apartment cost in " + areaName + "?", "acceptedAnswer": { "@type": "Answer", "text": "Most legal basement apartments range from about $45,000 to $85,000 depending on size, layout and finishes." } },
      { "@type": "Question", "name": "What areas do you serve?", "acceptedAnswer": { "@type": "Answer", "text": "Cambridge, Kitchener, Waterloo, Guelph, Paris and the surrounding Grand River region." } },
      { "@type": "Question", "name": "Do you offer financing?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — flexible financing options are available so you can spread the cost of your project over time." } }
    ]
  };
}
function jsonLdBlock(areaName) {
  const a = JSON.stringify(localBusinessJsonLd());
  const b = JSON.stringify(faqJsonLd(areaName));
  return `<script type="application/ld+json">${a}</script>\n<script type="application/ld+json">${b}</script>`;
}

function render(tokens) {
  let html = template;
  for (const [k, v] of Object.entries(tokens)) {
    html = html.split('{{' + k + '}}').join(v);
  }
  return html;
}

const pages = [];

// ---- home ----
pages.push({
  file: 'index.html',
  url: cfg.domain + '/',
  tokens: {
    TITLE: `Basement Apartments, Bathrooms & Waterproofing | ${cfg.brand} — Cambridge, Kitchener, Waterloo, Guelph & Paris`,
    DESC: `Legal basement apartments, bathrooms, renovations & waterproofing in Cambridge, Kitchener, Waterloo, Guelph & Paris. Free online estimate, instant cost calculator, book a call-back. Licensed & insured.`,
    CANONICAL: cfg.domain + '/',
    JSONLD: jsonLdBlock(cfg.regionAreaName),
    LEAD_ENDPOINT: cfg.integrations.leadEndpoint,
    CALCOM_URL: cfg.integrations.calcomUrl,
    MARK: cfg.mark, BRAND: cfg.brand, DOMAIN: cfg.domain, PHONE: cfg.phone, PHONE_TEL: cfg.phoneTel, EMAIL: cfg.email,
    REGION: cfg.region, LOC_ADJ: cfg.regionLocAdj, AREA_NAME: cfg.regionAreaName,
    BUILD_ID
  }
});

// ---- city pages ----
for (const c of cfg.cities) {
  pages.push({
    file: c.slug + '.html',
    url: cfg.domain + '/' + c.slug,
    tokens: {
      TITLE: `Basement Apartments & Renovations in ${c.name} | ${cfg.brand}`,
      DESC: `Legal basement apartments, bathrooms, renovations & waterproofing in ${c.name}, Ontario. Free instant estimate and cost calculator. Licensed & insured basement specialists.`,
      CANONICAL: cfg.domain + '/' + c.slug,
      JSONLD: jsonLdBlock(c.name),
      LEAD_ENDPOINT: cfg.integrations.leadEndpoint,
      CALCOM_URL: cfg.integrations.calcomUrl,
      MARK: cfg.mark, BRAND: cfg.brand, DOMAIN: cfg.domain, PHONE: cfg.phone, PHONE_TEL: cfg.phoneTel, EMAIL: cfg.email,
      REGION: c.name, LOC_ADJ: c.name, AREA_NAME: c.name,
      BUILD_ID
    }
  });
}

// write pages
for (const p of pages) {
  fs.writeFileSync(path.join(DIST, p.file), render(p.tokens));
}

// copy static assets
fs.copyFileSync(path.join(ROOT, 'src', 'styles.css'), path.join(DIST, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'src', 'app.js'), path.join(DIST, 'app.js'));
for (const f of ['hero.webp','ba-before.webp','ba-after.webp','p1-white-kitchen.webp','p2-walnut-kitchen.webp','p3-bathroom.webp','p4-exterior.webp','areas-feature.webp','logo.png']) {
  fs.copyFileSync(path.join(ROOT, 'src', f), path.join(DIST, f));
}

// sitemap + robots
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${p.url}</loc></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${cfg.domain}/sitemap.xml\n`);

console.log('Built ' + pages.length + ' pages into /dist:');
pages.forEach(p => console.log('  - ' + p.file + '  (' + p.url + ')'));
console.log('  + styles.css, app.js, sitemap.xml, robots.txt');
