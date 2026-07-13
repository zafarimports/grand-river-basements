# ZATTARI — Trial Funnel Email Automation

Six-email sequence that runs the 7-day free trial funnel end-to-end:
capture → build updates → urgency → checkout → win-back.

| # | File | Send | Trigger / goal |
|---|------|------|----------------|
| 1 | `01-welcome.html` | Instantly | Trial signup confirmed, sets expectations, links audit questionnaire |
| 2 | `02-day2-audit.html` | Day 2 | Audit delivered — "here's what's leaking" — builds authority |
| 3 | `03-day4-draft.html` | Day 4 | Live draft link — the "wow" moment, asks for feedback |
| 4 | `04-day6-ending.html` | Day 6 | Trial ends tomorrow — urgency + what they lose if the system goes dark |
| 5 | `05-day7-checkout.html` | Day 7 | Stripe checkout link — keep the system live |
| 6 | `06-day9-winback.html` | Day 9 | Didn't convert — one-question exit + 20% first-month save offer |

## Placeholders to replace before sending

`{{name}}` `{{business}}` `{{plan}}` `{{plan_price}}` `{{draft_url}}`
`{{checkout_url}}` `{{audit_url}}` `{{cal_url}}`

## Wiring (same stack already live on grandriverbasement.ca)

1. **Capture** — point `CONFIG.LEAD_ENDPOINT` in `index.html` at a Supabase
   Edge Function (copy `notify-lead` from the Grand River Basements repo).
   Store lead + `trial_started_at` in a `trials` table.
2. **Send** — Resend (resend.com). Free tier covers 3,000 emails/mo.
   Verify your sending domain first.
3. **Schedule** — a Supabase scheduled function (pg_cron) runs daily:
   `SELECT * FROM trials WHERE now() - trial_started_at BETWEEN interval 'X days' ...`
   and fires the matching template via the Resend API.
4. **Checkout** — create three Stripe Payment Links (one per plan) with a
   7-day trial on the price. Paste them into `CONFIG.STRIPE_LINKS` in
   `index.html` and into `{{checkout_url}}` in emails 4–6.
   Stripe then handles card capture, invoicing, dunning and cancellation.
5. **Stop conditions** — when Stripe webhook `checkout.session.completed`
   fires, mark the trial `converted` and the cron skips emails 4–6.

No-code alternative: pipe the form into Zapier → Gmail/Brevo with delay
steps. Slower and less owned, but zero infrastructure.
