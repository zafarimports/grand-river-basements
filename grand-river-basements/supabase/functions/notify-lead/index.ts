// Supabase Edge Function: notify-lead
// Receives a lead from the website, saves it, emails the client, and (optionally) texts them.
// Deploy with:  supabase functions deploy notify-lead --no-verify-jwt
//
// Set these secrets (Supabase → Edge Functions → Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (provided automatically in most setups)
//   RESEND_API_KEY        - from resend.com (free tier)
//   NOTIFY_EMAIL          - the client's email address to alert
//   FROM_EMAIL            - a verified sender, e.g. "leads@grandriverbasements.ca"
//   TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, NOTIFY_PHONE   - OPTIONAL, only if you want SMS

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  try {
    const lead = await req.json();

    // 1) Save to the database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await supabase.from("leads").insert(lead);

    const summary =
      `New estimate request\n\n` +
      `Name: ${lead.name}\nPhone: ${lead.phone}\nAddress: ${lead.address}\n` +
      `Email: ${lead.email || "-"}\n\n` +
      `Service: ${lead.service}\nCurrent state: ${lead.current_state}\nCity: ${lead.city}\n` +
      `Timeline: ${lead.timeline}\nBudget: ${lead.budget}\nBallpark shown: ${lead.ballpark}\n` +
      `Notes: ${lead.notes || "-"}`;

    // 2) Email the client (free via Resend)
    const RESEND = Deno.env.get("RESEND_API_KEY");
    if (RESEND) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: Deno.env.get("FROM_EMAIL"),
          to: Deno.env.get("NOTIFY_EMAIL"),
          subject: `New lead: ${lead.service} in ${lead.city} (${lead.timeline})`,
          text: summary,
        }),
      });
    }

    // 3) OPTIONAL: text the client (Twilio, ~CA$2/mo for a number + ~1c/text)
    const TW_SID = Deno.env.get("TWILIO_SID");
    if (TW_SID) {
      const body = new URLSearchParams({
        To: Deno.env.get("NOTIFY_PHONE")!,
        From: Deno.env.get("TWILIO_FROM")!,
        Body: `New lead: ${lead.name} — ${lead.service} in ${lead.city}. ${lead.phone}`,
      });
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TW_SID}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${TW_SID}:${Deno.env.get("TWILIO_TOKEN")}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
