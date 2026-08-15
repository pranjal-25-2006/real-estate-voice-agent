# Voice Agent Deployment Guide

## 🚀 Quick Start (Test Locally)

1. **Start the dev server:**
   ```bash
   cd real-estate-voice-agent
   npm run dev
   ```

2. **Test the voice agent:**
   - Open `http://localhost:3000/test-voice`
   - Type a message → See AI response + cost estimate

---

## 🔐 Dashboard Login (do this first)

The dashboard and every internal API route now require login — only the
Bolna and Cal.com webhooks stay public (they verify their own secrets
instead).

1. Generate a session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Generate a password hash:
   ```bash
   node scripts/hash-password.mjs "your-chosen-password"
   ```
3. Add all three to `.env.local`:
   ```bash
   AUTH_USERNAME=admin
   AUTH_PASSWORD_HASH=<output from step 2>
   AUTH_SESSION_SECRET=<output from step 1>
   ```
4. Restart the dev server, open `http://localhost:3000`, you'll be redirected
   to `/login`.

This is single-admin auth (no user table) — fine for one founder running
the business, not meant for many separate logins. If you later need
per-client-team logins with roles, swap this for next-auth or Clerk.

---

## ⚡ Outbound Speed-to-Lead Calling (Bolna)

Previously this app could only *receive* results from Bolna after a call
already happened (`/api/voice/bolna/webhook`). It now *places* the call too.

### Setup
1. In Bolna's dashboard, copy your agent's **Agent ID**.
2. Add to `.env.local`:
   ```bash
   BOLNA_API_KEY=your_bolna_api_key
   BOLNA_AGENT_ID=your_bolna_agent_id
   ```
3. That's it — two ways calls now go out:
   - **Automatically**: every new lead created via `POST /api/leads` (e.g. a
     website form, a future WhatsApp integration) gets called within
     seconds, unless it came in with `source: "phone_call"` (no point
     calling someone who just hung up) or you set
     `AUTO_CALL_NEW_LEADS=false`.
   - **Manually**: open any lead in the dashboard → **Call Now**.

### How it fits with the existing webhook
Triggering the call and receiving its result are two separate steps:
`triggerOutboundCall()` (`src/lib/bolna.ts`) hits Bolna's `/call` API and
gets back an `execution_id`, which is saved as a placeholder `Conversation`
row. When the call finishes, Bolna's webhook (`/api/voice/bolna/webhook`)
posts back to the **same** `execution_id`, and the existing `upsert` fills
in the transcript, summary, and duration — no duplicate row, no schema
change needed.

### Note on phone numbers
`triggerOutboundCall` assumes Indian numbers and converts them to E.164
(e.g. `98765 43210` → `+919876543210`). If you expand outside India, revisit
`toE164India()` in `src/lib/bolna.ts`.

---

## 📞 Connect Twilio (Real Phone Calls)

### Step 1: Get Twilio Account
- Sign up at [twilio.com](https://www.twilio.com)
- Buy a phone number (~₹1,000/year)
- Get: `ACCOUNT_SID` + `AUTH_TOKEN`

### Step 2: Set Webhook URL
In Twilio Console → Phone Number → Manage → Active Numbers:
- **When A Call Comes in:** Webhook
- **Request URL:** `https://your-domain.com/api/voice/twilio`
- **HTTP Method:** `POST`

### Step 3: Set Environment Variables
Create `.env.local`:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
SARVAM_API_KEY=your_sarvam_key    # ₹0.30/min (STT + TTS)
GROQ_API_KEY=your_groq_key          # Free tier (Llama 3)
```

### Step 4: Test with Real Call
1. Call your Twilio number
2. AI greets you (in English/Hindi)
3. Speak your requirements
4. AI responds + saves lead to dashboard

### How the real-time pipeline works now
Previously `/api/voice/twilio/transcribe` returned a hardcoded fake reply.
It now does the real thing on every turn of the call:
1. Downloads the caller's recorded audio from Twilio (needs `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` for auth)
2. Sends it to Sarvam's Speech-to-Text (`saaras:v3`, auto-detects Hindi/English/Hinglish)
3. Sends the transcript + lead context + last 10 turns to Groq for a reply
4. Sends the reply to Sarvam's Text-to-Speech (`bulbul:v3`) and stores the audio in a new `AudioClip` DB table
5. Twilio's `<Play>` fetches that audio from `/api/voice/audio/[id]` and speaks it, then records the next turn

**Known limitation:** this is still "record then process then play" per turn (not real-time streaming), so expect
2-4 seconds of dead air after the caller finishes speaking while STT, the LLM, and TTS run in sequence. That's
normal for this architecture — Twilio Media Streams + WebSockets is the fix if you need barge-in or near-zero
latency later, but it's a bigger rebuild. This version is fine for validating the product and early client demos.

**Before your first real test call**, run:
```bash
npx prisma generate
npx prisma migrate dev --name add_audio_clips
```
(the `AudioClip` table needs to exist — this repo's Prisma client couldn't regenerate in the sandbox this was
built in, so this step is on you, once, locally.)

---

## 💰 Cost Breakdown (Per Call)

| Component | Provider | Cost (INR) |
|-----------|----------|--------------|
| **Speech-to-Text** | Sarvam AI | ₹0.30/minute |
| **LLM (AI Brain)** | Groq (Llama 3) | ₹0 (Free tier) |
| **Text-to-Speech** | Sarvam AI | ₹0.50/minute |
| **Twilio Phone** | Twilio | ₹1.15/minute |
| **TOTAL (2-min call)** | | **₹3.45** |

**vs Human Agent:** ₹300-500/hour  
**Your AI Agent:** ₹3.45/call (24/7, no breaks)

---

## 🌐 Deploy to Production

### Option A: Vercel (Easiest - Free Tier)
```bash
npm i -g vercel
cd real-estate-voice-agent
vercel --prod
```
- Gets `https://your-app.vercel.app`
- Add env vars in Vercel dashboard
- Update Twilio webhook to production URL

### Option B: Self-Host (Cheapest Long-Term)
```bash
# Buy VPS (₹500/mo): DigitalOcean/Linode
# Install Node.js + Nginx + PM2
npm run build
pm2 start npm --start
```

---

## 📊 GoHighLevel vs Your Product

| Feature | GoHighLevel | Your Product |
|----------|---------------|---------------|
| **Price** | $97/mo (₹8,000) | **₹5,000/mo** |
| **Voice AI** | $97 add-on | **₹3.45/call** |
| **India Focus** | No | **Yes (Sarvam/Hinglish)** |
| **WhatsApp** | Paid | **Native (coming)** |
| **White-Label** | Expensive | **Free** |

**Selling Point:**
> "GoHighLevel charges ₹15,000/mo and doesn't speak Hinglish. We're ₹5,000/mo, built for Indian real estate."

---

## 🎯 Next Features to Build

1. **WhatsApp Integration** (Twilio/Interakt)
2. **Multi-Language Support** (Hindi, Tamil, Telugu)
3. **Property Image Search** (Upload photo → AI matches property)
4. **Auto-Follow-Up SMS** (Send property brochure via WhatsApp)
5. **Agent Transfer** (Complex queries → Human agent)

---

## 🔧 Troubleshooting

**Problem:** Twilio not connecting  
**Fix:** Check webhook URL is HTTPS (Twilio requires SSL)

**Problem:** Sarvam API failing  
**Fix:** Check API key + use fallback TTS (Twilio `<Say>`)

**Problem:** High latency  
**Fix:** Use Groq (fastest) + Sarvam (India servers)

---

**Need help?** Open an issue or DM me 😊