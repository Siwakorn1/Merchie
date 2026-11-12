# Merchie: technical overview

A self-contained brief for engineers (or another AI) answering technical questions about Merchie.
It covers what the prototype is built with, how it is structured, and the plan for real data,
social listening and AI. Product context lives in `docs/merchie-brief.md`; build status and change
history in `docs/progress.md`; coding rules in `CLAUDE.md`.

_Written 2026-11-12. Platform API details below come mostly from third-party integration guides,
not official docs, so confirm them on each platform's developer portal before relying on them._

---

## 1. What Merchie is

A "Shop Health" app for Thai online sellers (Shopee, Lazada, TikTok Shop, IG/FB). Every day it
scores the shop out of 100 in four parts (legal, platform, reputation, business; 25 each), flags
problems, and helps fix them with AI that always cites the law or platform policy it relies on.
Three core features:

1. **Shop Health:** one score ring split into the four parts, alerts, Legal Checklist.
2. **Fix-it:** a list of everything to fix. AI rewrites risky listings and drafts customer
   replies under legal guardrails. Also hosts tools (copy checker, tax, crisis mode, live-commerce
   tools, reseller listing checks).
3. **Shield:** an Evidence Vault (automatic daily record) plus generated appeal/complaint documents.

Built for the Chula LegalTech Y8 competition. Demo story: a skin-cream shop on Shopee with a
"whiter in 7 days, treats melasma" listing (cosmetics-law violation), an allergy review, and a
suspension that needs an appeal.

Hard rules that shape the architecture:
- **Official platform APIs with seller OAuth only. Never scrape.**
- Every legal flag or suggestion cites a law or policy clause; legal outputs carry a "not legal
  advice" note. Merchie prepares documents; it does not represent anyone (Lawyers Act s.33).
- Reply guardrail: never threaten customers, expose their personal data, accuse them, admit fault
  beyond the facts, or deny statutory rights.
- PDPA: customer data is minimised and masked.

---

## 2. Current prototype (what exists today)

**Type:** mobile-first web app (PWA-style), opened by scanning a QR code; no native app. On desktop
it renders inside a phone frame with a QR beside it.

**Stack**

| Layer | Choice |
|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `app/globals.css` (light/dark, per-look accents) |
| UI pieces | Vaul (bottom sheets), Motion (animation), Lucide (icons), qrcode.react |
| Fonts | Anuphan (UI), Fredoka (score numerals) via `next/font` |
| State | React context (`lib/demo-store.tsx`), in memory, resets on reload |
| Data | Static mock JSON shaped like Shopee Open Platform responses (`mock/`) |
| i18n | Thai/English via `lib/i18n.ts` (`t(th, en)`, `tr({th,en})`) |
| Hosting | Vercel, auto-deploy from GitHub repo `Siwakorn1/Merchie` (`main`) |

**There is no backend, database, auth, real platform connection, payment or real AI call yet.**
All "AI" output (listing rewrites, reply drafts, chat answers, live analysis) is pre-written or
rule-based, shaped like what a model would return.

**Folder map**

```
app/(app)/            routes: / (home), /alerts, /fix-it, /shield, /shop
components/
  health/             score ring (4 segments), breakdown, issues, checklist, platform monitor
  fixit/              Fix-it list and job detail; tools/ (checker, tax, crisis, live, script, cf, reseller)
  shield/             help cases, appeal letter, Evidence Vault, export (CSV/JSON/TXT)
  shop/               profile, plans, platforms, LINE, team, monthly score, report, about
  chat/               "Ask Merchie AI" chat (keyword "brain" in lib/content/chat-brain.ts)
  ui/                 plan badge/offer/picker, gate, sheet, toast, segmented, slider, AI mark
  mascot/             Merchie mascot (SVG, 5 looks) and props
  shell/              app shell, header, tab bar, pull-to-refresh, desktop frame
lib/
  plans.ts            plan tiers, prices, limits
  demo-store.tsx      app state (plan, platforms, fixes used, Shield cases, docs, LINE…)
  health/score.ts     score model (4 × 25) computed from the mock platform data
  legal/citations.ts  law/policy citations (sections flagged `review: true` need lawyer check)
  content/*.ts        issues, fix jobs, tools, live-commerce data, Shield cases, about, business demo
mock/shopee/*.json    account_health, comments, products (Shopee-shaped)
mock/merchie/*.json   shop profile, platforms, checklist, score history, review feeds
```

**Score model (`lib/health/score.ts`):** each part starts at 25 and loses points per factor (e.g.
treatment claim −10, missing FDA number −4, penalty points, unanswered negative reviews, VAT
threshold proximity). Every factor carries a citation id. Demo: 59 at start, rising as issues are
fixed.

---

## 3. Plans (`lib/plans.ts`)

| | Check up | Care | Coach | Business |
|---|---|---|---|---|
| Price | Free | ฿199/mo | ฿1,199/mo | ฿11,999/mo |
| Health score (4 parts) | ✓ | ✓ | ✓ | ✓ |
| Fix-it one-tap fixes | – | 10/month | unlimited | unlimited |
| Platforms | 1 | 3 | all | all + many shops |
| Customer insight | – | ✓ | ✓ | ✓ |
| Live Coach (live analysis, script check, CF orders) | – | – | ✓ | ✓ |
| Shield | ~฿499/case | ~฿499/case | included | included |
| Team seats | 1 | 1 | 3 | unlimited |
| Reseller listing checks | – | – | – | ✓ |
| Monthly report + account manager | – | – | – | ✓ |

Code ids: `free` / `plus` / `pro` / `business`. In the demo, "Try" opens a plan picker and starts a
trial instantly; checkout is simulated.

---

## 4. Getting real shop data (platform APIs)

Two permissions are always needed: (1) Merchie registers as a developer on each platform and passes
app review; (2) each shop authorizes Merchie through OAuth and can revoke it.

| Platform | What it takes | Data Merchie needs | Can start now? |
|---|---|---|---|
| **Shopee Open Platform** (open.shopee.com) | Developer verification, create app (Partner ID/Key), app review (live HTTPS URL, test account); seller authorization reportedly lasts ~365 days; some regions have seller-tier/volume requirements | Account health (penalty points, listings with issues, late orders), products, product comments (get/reply), orders, returns | Partly: sandbox testing before approval |
| **TikTok Shop Partner Center** (Thailand region) | Developer registration, app with scopes, app review; credentials are per regional Partner Center; only the main shop account can authorize | Products, orders, reviews; whether Thailand uses Account Health Rating or violation points is unconfirmed | After approval |
| **Lazada Open Platform** (open.lazada.com) | Register, app approval, per-shop seller authorization | Products, orders, `/review/product/get` | After approval |
| **Meta Graph API** (IG/FB) | Business verification + App Review for comment permissions | Comments on the shop's posts, mentions/tags | After approval |
| **LINE Messaging API** | Create a LINE Official Account, enable Messaging API | Push morning brief and urgent alerts | Yes, now (monthly free message quota; paid above it) |

Practical path: keep the mock data for the competition demo; build against Shopee sandbox and LINE
first; apply for app review on every platform in parallel. App reviews generally expect a real
company, website and privacy policy.

Sources: [Rollout: Shopee API essentials](https://rollout.com/integration-guides/shopee/api-essentials),
[API2Cart: Shopee](https://api2cart.com/how-to-connect-shopee-to-api2cart),
[Odoo: Shopee connector](https://www.odoo.com/documentation/19.0/applications/sales/sales/shopee_connector/setup.html),
[InlinexDev: Shopee guide](https://developer.inlinex.com.sg/blog/shopee-api-integration-guide-sellers),
[TikTok for Developers: Shop updates](https://developers.tiktok.com/blog/tiktok-shop-developer-updates),
[TikTok: Getting started FAQ](https://developers.tiktok.com/docs/en/getting-started-faq),
[unified.to: TikTok Shop app setup](https://unified.to/blog/how_to_setup_a_tiktok_shop_application.md),
[Apideck: TikTok Shop OAuth](https://developers.apideck.com/connectors/tiktok/docs/application_owner+oauth_credentials),
[Jentic: Lazada Open Platform](https://jentic.com/apis/open.lazada.com/lazada).

---

## 5. Social listening

- **Exists in Thailand:** Wisesight's Zocial Eye covers Facebook, Instagram, X, YouTube, TikTok and
  **Pantip**, with Thai sentiment classification. Global: Brandwatch, Talkwalker, Meltwater.
  No public Zocial Eye API was found; access is likely enterprise/partner.
- **Why Merchie doesn't do it itself in phase 1:** Pantip has no public API (the only way would be
  scraping, which our rules forbid); X's API is paid; TikTok doesn't open other creators' content
  for this commercial use.
- **Plan:** Phase 1 listens only to the shop's own channels through official APIs (marketplace
  reviews, comments on its own posts, IG mentions/tags): this is "Customer Insight" in the app.
  Phase 2 licenses off-page data from a partner (e.g. Wisesight) and adds Merchie's legal layer.

Sources: [Wisesight Zocial Eye](https://wisesight.com/zocialeye),
[SoftwareOne: Zocial Eye](https://platform.softwareone.com/product/zocial-eye/PCP-3299-3034),
[Marketing Oops: Zocial Eye](https://www.marketingoops.com/?p=310551).

---

## 6. AI plan (not built yet; needs the owner's approval and an API key)

**Provider:** Claude API (Anthropic). Reasons: strong Thai, built-in citations on supplied
documents (fits "every legal output cites its source"), structured JSON outputs, prompt caching.

**Model per job** (list prices per 1M tokens, input/output, as of Nov 2026):

| Job | Volume | Model | Price |
|---|---|---|---|
| Listing rewrite with citations, guarded customer replies, Shield appeal documents, script check | Low, must be right | Claude Opus 5.5 (`claude-opus-5-5`) | $4 / $20 |
| "Ask Merchie AI" chat | Medium | Opus 5.5 at low effort, or Claude Sonnet 5.5 (`claude-sonnet-5-5`) | $2 / $10 (Sonnet) |
| Review/comment classification, sentiment, praise/complaint themes, scanning live transcripts | High, daily | Claude Haiku 5.5 (`claude-haiku-5-5`) | $0.10 / $0.50 |

**Design notes**
- **Legal knowledge base:** the laws Merchie uses are few (Cosmetics Act, Consumer Protection Act,
  Food Act, PDPA, Criminal Code defamation sections, Revenue Code VAT, platform policies). Put the
  relevant sections in a cached system prompt or as documents with citations enabled; a vector
  database isn't needed at this size. Section numbers marked `review: true` in
  `lib/legal/citations.ts` need a lawyer's check first.
- **Cost controls:** prompt caching (cached reads ~10% of input price), Batch API (50% off) for the
  nightly review scan, structured outputs so results drop straight into the UI, effort setting per
  route.
- **Rough cost per Care shop per month:** ~300 reviews classified (Haiku) ≈ $0.03; 10 fixes (Opus)
  ≈ $0.5; ~50 chat messages ≈ $0.5–1. Under ~$2 (~฿70) against a ฿199 plan.
- **Guardrails:** a reply is checked against the five forbidden patterns before it is shown;
  outputs without a citation are rejected; customer names/phones/addresses are masked before any
  text is sent to the model.
- **Live analysis** needs a separate Thai speech-to-text step (the model reads text, not audio),
  and platform access to live audio is unconfirmed; the safe path is analysing an uploaded
  recording or a pasted script.
- Check Anthropic's current data-retention terms for API use before going live (PDPA).

---

## 7. Proposed production architecture

```
Phone (PWA, Next.js)  ──►  Next.js API routes on Vercel
                              │  OAuth callbacks (Shopee / TikTok / Lazada / Meta)
                              │  AI calls (Claude API) with guardrail + citation checks
                              │  LINE webhook / push
                              ▼
                       Supabase (Postgres + Auth + Storage)
                         shops, platform tokens (encrypted), daily scores,
                         issues, fixes, Evidence Vault (files), plans/billing
                              ▲
             Scheduled jobs (Vercel Cron / Supabase cron):
             sync each shop daily → compute score → batch AI scan → LINE morning brief
                              │
             Payments: Omise or 2C2P (PromptPay) for plans and Shield per-case
```

Not decided yet (owner must approve per `CLAUDE.md`): database (Supabase is the candidate), AI
provider, any backend service, payment provider.

---

## 8. Open technical questions

1. Exact API scopes per platform (especially Shopee account-health endpoints and TikTok Shop
   Thailand's health system).
2. Whether the business score can rely on platform revenue data, or the shop enters it.
3. Speech-to-text vendor and legal access to live audio for Live analysis.
4. Data retention and PDPA consent flow for customer data passing through Merchie and the AI API.
5. Company registration and policies needed for platform app reviews.
