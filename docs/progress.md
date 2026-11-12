# Merchie prototype: current state

Living status doc. **Update this file at the end of every work session**: what changed, what's decided, and what's still open. CLAUDE.md holds the rules; this file holds where things stand. For a self-contained technical brief (stack, APIs, social listening, AI plan) to hand to another engineer or AI, see `docs/technical-overview.md`.

_Last updated: 2026-11-11 (end of session 2)_

## Technical research (2569-11-12)
- Wrote `docs/technical-overview.md`: current stack and folder map, plan table, what each platform API needs (developer app review + seller OAuth; Shopee has a sandbox; LINE can start now), social listening (Wisesight Zocial Eye covers Pantip; Merchie does own-channel listening in phase 1, partner data in phase 2), and the AI plan (Claude: Opus 5.5 for legal outputs, Sonnet 5.5 or low-effort Opus for chat, Haiku 5.5 for bulk review classification; caching, batch, structured outputs; under ~$2 per Care shop per month).

## Plans v3: four tiers (owner's table, 2569-11-12)
- **Check up (free) / Care (฿199) / Coach (฿1,199) / Business (฿11,999)** (prices updated from the owner's slide, 2569-11-12), ids `free` / `plus` / `pro` / `business` in `lib/plans.ts`. Business badge is deep navy (`--plan-biz-*` tokens).
- **Limits** (`PLATFORM_LIMIT`, `FIX_LIMIT`, `SEAT_LIMIT`, `planFor()` picks the cheapest plan above a usage):
  - Platforms 1 / 3 / unlimited / unlimited (Business also many shops).
  - Fix-it one-tap fixes 0 / 10 per month / unlimited / unlimited. Care shows "เหลือ x/10 เดือนนี้"; when used up, a fix opens the Coach offer. Usage = `fixesUsed` (resolved issues) in the demo store.
  - Team seats 1 / 1 / 3 / unlimited (owner counts as one). Extra shops are Business only.
- **Live Coach** (Coach+): Live analysis, Script check and CF data.
- **Shield** is open to every plan (the Vault fills on all). Preparing a case document (appeal or help case) is ~฿499 per case on Check up and Care (simulated checkout, `shieldCases` remembers paid cases), or included on Coach+. Export is Coach+.
- **Business demo screens:** Fix-it tool "ตรวจ listing ตัวแทน" (`components/fixit/tools/reseller-tool.tsx`, data `lib/content/business.ts`): resellers' listings scanned for risky claims, safer wording, "ask the reseller to fix it". Shop row "รายงานรายเดือน" (`components/shop/report-sheet.tsx`): month KPIs, highlights, next steps, downloadable report, account manager card (chat / book a call, simulated).
- Unchanged tiers for everything else: Care keeps LINE, chat, looks, 12-month history, unlimited copy checks; Coach keeps tax, crisis, Rainbow look.
- Screenshots in `~/Documents/marchie-screenshots/` were taken before v3 (3 tiers); retake the plan/lock set if needed.

## Deploy, screenshots and assets (end of session 2)
- **GitHub:** the owner pushes. Repo `github.com/Siwakorn1/Merchie`, first real commit "Merchie prototype". Changes made after that commit (plan popup wording "ฟรีก่อนเลย", look reset on downgrade, this doc) still need `git add . && git commit && git push`.
- **Vercel:** deploy by importing the GitHub repo at vercel.com/new (team "siwakorn1's projects"); every push to `main` redeploys. No env vars needed. `.vercelignore` and `.gitignore` keep the unused FC Minimal font files out (license). The production URL is not known yet; the desktop QR picks up `window.location.origin`, so it is correct once opened from Vercel.
- **Phone testing on the LAN:** `npm run dev -- -H 0.0.0.0 -p 3000`, then `http://<LAN-IP>:3000` (`?demo=0` hides the demo slider).
- **Screenshots** live outside the repo at `~/Documents/marchie-screenshots/` (guide in `อ่านก่อน.txt` there): light/dark × TH/EN, every Merchie look in light and dark, full-length pages, plan popups and locks, desktop view, transparent phone mockups, and 4K slide composites. All captured on the dev server with the Coach plan (except the plan/lock set). The capture scripts were throwaway (puppeteer-core in a temp folder), not in the repo.
- **App icon prompt** for image generators: `docs/brand/app-icon-prompt.md` (classic blue Merchie peeking up from the bottom edge, like the reference image).
- **Plan downgrade resets the look:** switching to a lower plan (Coach to Care, or anything to Check up) sets Merchie back to Classic (`setPlan` in `lib/demo-store.tsx`). Upgrades keep the chosen look.
- **Trial wording:** no trial length anywhere ("ทดลอง X ฟรีก่อนเลย" / "Try X free"), so demo visitors aren't misled.

## Latest polish
- **Plan popup for every "Try":** `PlanPickerProvider` / `usePlanPicker` (`components/ui/plan-picker.tsx`, mounted in AppShell). `useTryPlan()` and `PlanOffer`'s button now open it: Care and Coach side by side with price and key features, the cheapest plan that unlocks the feature preselected (lower plans disabled), then "ทดลอง X ฟรีก่อนเลย" (no trial length, so demo visitors are not misled). Nothing upgrades until the shop confirms.
- **Locked screens (`ProGate`)** show the page blurred with the plan choice in a bottom-sheet popup over it (separate from the page). "ไว้ก่อน" closes it and leaves one "ปลดล็อกด้วย X" button to reopen.
- **Parts always add up:** `partsForScore` (`lib/health/score.ts`) re-splits a simulated total across the four parts by scaling each part's missing points, then rounds with largest remainder. Hero ring and breakdown sheet both use it, so the four parts always sum to the score shown (100 fills all four, 0 empties them).
- **Demo panel** (top-right on Home) is just "จำลองคะแนนร้าน": a thick iOS-switch-style slider (`components/ui/thick-slider.tsx`, knob inset evenly, fill color follows the score) plus "Simulate: shop suspended". Plan and language switching moved out (Plan sheet / Shop settings).
- **Speech bubble** centered above the ring (was off-center and ran past narrow screens).
- **Lazada** now uses its official heart mark (Wikimedia Commons, public domain) at `public/brands/lazada.svg`.
- **English layout pass:** shortened labels that wrapped or truncated in English (issue titles, Shield help titles, document types, review themes, insights, plan features); added truncation to added-document rows.

## Latest changes (plans v2)
- **Plans renamed and reshuffled** to the owner's sheet: Check up (free, 1 platform) / Care (Tier 1: score analysis, customer insight, more platforms) / Coach (Tier 2: Live analysis, Script check, CF data). Everything not mentioned kept its tier. Demo starts with Shopee only.
  - Care gates: breakdown deductions ("AI explains what this part lost points for"), issue steps and citations, platform-monitor Customer insight (reply rate, sentiment, praise/complaints). Rating and reviews stay free.
- **New Coach tools** in Fix-it (`components/fixit/tools/{live,script,cf}-tool.tsx`, data in `lib/content/live.ts`):
  - Live analysis: simulated live transcript appears line by line; risky lines flagged with a safer line to say and the law.
  - Script check: line-by-line check of a live/clip script, suggested rewrite, "use the safe version".
  - CF data: parses "CF A1 x2" comments into orders, totals by product and by buyer, paid share ring, pay-link reminders, CSV export. Usernames stay masked.
- **Hero ring** split into four arcs, one per part (small gaps, so it still reads as one ring). Each part's score sits off the outer corner of its own arc: number (23px) and a small 11px label centered on each other, label above the number for the top two and below it for the bottom two (narrow number nearest the ring). Ring 248px so the labels have room. Bubble moved above the ring. Arc coordinates are rounded to avoid a hydration mismatch.
- **AI mark** is now a four-point star with a sky-to-violet gradient.
- **No overclaims:** removed "Social listening (coming soon)", "every platform" (now "more platforms"), the LINE reply-time promise, and the partner-lawyer network (Shield now "prepares documents for your lawyer").

## Earlier in session 2
_Some details here were superseded later: plan names are now Check up / Care / Coach (not ฟรี / เมฆเงิน / เมฆทอง), Check up connects 1 platform (not 2), and the demo panel is only the score slider plus the suspension simulation._

- **3 plans:** ฟรี / เมฆเงิน / เมฆทอง (EN Free / Silver / Gold), metal badges (tokens `--plan-*`). `lib/plans.ts` holds names, prices and features. `useDemo()` has `plan`, `has()`, `upgrade()`, `setPlan()`.
  - Gating: Fix-it jobs, LINE, chat, looks, 12-month history and issue steps/citations need เมฆเงิน. Shield, tax, crisis and team need เมฆทอง. The copy checker is free with 10 checks a month (ring meter), unlimited on เมฆเงิน.
  - Plan sheet (Shop > แพ็กเกจ, or tap the profile badge) compares the 3 tiers.
- **Shop tab, every row works:**
  - Platform rows open a manage sheet (watched counts, scopes, sync now, disconnect).
  - Add platform runs a mock OAuth consent (scopes, "อนุญาต", then `connect`). ฟรี stops at 2 apps.
  - LINE: simulated connect page with a live morning-brief preview, toggles and time. Brief text is built from live shop state.
  - Team and shops (เมฆทอง): add shops, invite admins (simulated).
  - About (`components/shop/about-sheet.tsx`, content in `lib/content/about.ts`): laid out like a shipped app. App icon, version 0.9.0 (2569.11), then rows: what's new, rate (toast), share (native share sheet or copy link), help center (FAQ accordion), contact LINE @merchie (toast), privacy and data (PDPA, cited), terms of use (not a law firm), open-source licenses. Each row opens its own page inside the sheet with a back button.
- **Demo panel:** plan chips and "เริ่มเดโมใหม่" (`resetDemo`).
- **Score color ramp:** red only under 30, then amber blending into green. Bands now 0–29 danger, 30–69 watch, 70+ good.
- **Monthly score insights** (`components/shop/score-insights.tsx`): Merchie's verdict on the year and trend, year average, benchmark ring against same-category shops (mock peers in `shop.json`), and on เมฆเงิน the weakest part with next month's target if every open issue gets fixed (taps through to Fix-it).
- **Mascot:** black dot eyes by default (`eyes="dot"`); props redrawn as glossy 3D objects that float and bob; hands removed.
  - Dot eyes blink by squashing the dot itself (no separate eyelid layer), so a blink never shows a patch in a different color from the body. Mood lids become a light squash; brows carry the expression.
  - New look **`rainbow` (ราชินีสายรุ้ง / Rainbow Royal)**: pastel rainbow gummy body with a clipped gloss layer, a gold crown with gems and pearls, rainbow sparkles. เมฆทอง only (its card spans two columns in the picker). Switches the app to a new `violet` accent with a pastel-rainbow background.
- **Checklist documents:** "+ เพิ่มเอกสาร" at the bottom of the Legal Checklist (`components/health/add-doc-sheet.tsx`, types in `lib/content/documents.ts`). Pick a type (cosmetic notification, food/supplement FDA no., TIS, trademark, other), then number (format check only, not an agency lookup), product or name, expiry date and a file. Saved documents appear in the checklist with their expiry, and their detail sheet cites the law and can remove them. Kept in the demo store; `resetDemo` clears them. New citations: `food-reg`, `tis` (both `review: true`).
- **VAT row:** back to the original (percentage beside a small ring), at the owner's request.
- **No sideways panning:** the main scroller is `overflow-x-hidden` + `overscroll-x-none`, and html/body use `overflow-x: clip`, so the app never wiggles left-right (seen on desktop trackpads).
- **AI labels:** `AiMark` (`components/ui/ai-mark.tsx`, a single sparkle icon in the accent color, no text, no pill) marks AI features: Fix-it job rows and the AI-suggested listing, "polish with Merchie AI", tax and crisis tools, the crisis statement, tax tips, review themes and the draft-reply button in the platform monitor, and the monthly-score verdict. Chat is now "ถาม Merchie AI"; issue fix buttons read "ให้ AI แก้ให้" / "ให้ AI ร่างคำตอบ". Nearly all of these are Silver and up.
- **Platform monitor** (`components/health/platform-monitor.tsx`, data in `mock/merchie/reviews.json`): tap a card in Home's "กำลังเฝ้า" strip. Shows average rating with a 5-to-1 star breakdown (30 days), rings for reply rate and positive share, the 1–2 star count, what customers praise and complain about, then every review with a filter (all / unanswered / 1–2 stars).
  - Reviews linked to an open issue go to the guided fix in Fix-it, and show as answered once fixed there.
  - Other unanswered reviews get a one-tap guardrail-safe reply (thanks for 4–5 stars; apology plus "message the shop with your order number" for 1–2 stars).
  - Platforms without a feed yet (e.g. newly connected Lazada) show a "fetching reviews" state.
- **Product photos:** thumbnails are real photos now (free Pexels stock with no third-party branding, `public/products/`, sources in `CREDITS.md`): cream jar, serum dropper, blank tube with a rose cap. Swap for the shop's real listing images once the platform API is connected.
- **Product thumbnails:** the floating red urgent dot is gone. Urgent thumbnails get a thin red ring around the image instead, and the platform logo sits inside the image corner rather than hanging off it.
- **Rainbow Royal extras:** the violet theme gets an aurora sky (pastel blobs drifting slowly) with twinkling sparkles behind all content (CSS in `globals.css`, off for reduced motion). Merchie gets a halo with slowly turning rainbow light rays (`RoyalAura` in `mascot.tsx`). Props: crystal sceptre and gold scales of justice.
- **Plan badges** are short and icon-free: Free / Silver / Gold (`PLAN_SHORT`). Full names (ฟรี / เมฆเงิน / เมฆทอง) stay in copy via `PLAN_NAME`.
- **Shop avatar** redrawn as an indie skincare-brand logo: nude-blush background, glossy cream jar with a rose lid, "saisai" serif wordmark.
- **Font:** back to Anuphan. Monthly score text sizes bumped one step.
- **Sync indicators** spin briefly, then show a green tick (no endless loading).
- **Data collection answer given to owner:** official partner APIs per platform with seller OAuth (Shopee first), no scraping or listening. AI via Claude API is feasible but needs the owner's go-ahead.

**Copy rules learned this session:**
- Never use the middle dot "·" as a separator; put each piece on its own line.
- No bullet dots in front of tips.
- Keep copy minimal.

## How to run
- `npm run dev -- -H 0.0.0.0 -p 3000`, then open `http://<LAN-IP>:3000` on a phone on the same Wi-Fi. `allowedDevOrigins` permits LAN IPs.
- If CSS or theme edits don't show up, restart the dev server. Turbopack has kept `globals.css` in memory even with the dev filesystem cache off. `next build` is not affected.
- Dev-only pages:
  - `/dev/mascot?jelly`: every look × mood
  - `/dev/preview?s=home|alerts|fixit|shield|shop`: full-height screenshots
  - `/dev/style`: early style tile
- `?demo=0` hides the demo controls for judges.

## What's built

### Shell and feel
- App shell (`components/shell/`):
  - Fixed header with a 28px page title, plus content that scrolls in the middle.
  - Clear-glass floating tab bar (icons only).
  - Real bottom spacer, so content scrolls clear of the bar.
- Pull-to-refresh: just Merchie in a round chip with a ring that fills as you pull and spins while refreshing (no text, no per-shop ticks), then the page re-mounts and a toast confirms.
- Desktop phone frame:
  - Fake status bar and dynamic island.
  - Mascot, tagline and QR beside the frame.
- Motion:
  - Cloud-wipe transition for special events only: the splash, jumping to a fix, a fix done, a suspension.
  - Slide in/out between tabs.
- Themes:
  - Light/dark mode (Shop tab, saved and applied before paint).
  - The accent follows Merchie's look: blue / red / green / yellow.
- Segmented control (`components/ui/segmented.tsx`): one pill that slides with a short motion blur and stretch (0.32s). Views inside sheets sit on a fixed-height stage, so the toggle never jumps.
- Bilingual TH/EN (`lib/i18n.ts` with `t()` and `tr()`; data primitives in `lib/i18n-core.ts`).

### Merchie (mascot)
- Built in `components/mascot/mascot.tsx`.
- Every look is translucent ("jelly" treatment).
- Eyes are plain black dots by default (`eyes="dot"`). Split white eyes (`eyes="split"`) and the single band (`eyes="band"`) remain for comparison in `/dev/mascot`.
- Interactions: blink, eye tracking, tap squish, drag stretch, long-press shy.
- Moods: `delighted / happy / okay / worried / sad / shocked`, set by `scoreToMood`:
  - below 30: sad
  - 30–54: worried
  - 55–74: okay
  - 75–89: happy
  - 90 and up: delighted
- Looks:

| id | name (TH / EN) | props in hand | accent | plan |
|---|---|---|---|---|
| `jelly` | คลาสสิก / Classic | gavel + clipboard | blue | ฟรี |
| `guardian` | ผู้พิทักษ์ / Guardian | shield + magnifier | red | เมฆเงิน |
| `money` | เหนี่ยวทรัพย์ / Lucky | coin + banknotes | green | เมฆเงิน |
| `fantasy` | แฟนตาซี / Fantasy | star wand + clipboard | yellow | เมฆเงิน |
| `rainbow` | ราชินีสายรุ้ง / Rainbow Royal | crown + crystal sceptre + scales of justice | violet | เมฆทอง |

- "ของในมือ" toggles the floating props. Glasses, the robe, and hands were tried and removed at the owner's request.

### Shop Health (Home)
- The score is the sum of **4 parts × 25** (legal / platform / reputation / business), in `lib/health/score.ts`. There is no cap. Each deduction is in 25-point units and cites a law.
- Ring colour: red only below 30, then a continuous amber-to-green blend (`scoreColor`/`scoreInk`).
- Hero layout:
  - A frosted speech bubble at the upper right holds the big score (Fredoka font) and a short, cute Merchie line.
  - Tapping the bubble opens the breakdown sheet: total plus four bars, then per-part rows from "full marks" down to "score".
- Below the hero:
  - "To fix" list (4 issues; the penalty-points issue was removed by request)
  - "Watching" platform strip with an "Add shop" sheet (8 platforms)
  - Legal Checklist (VAT ring)
- Demo story numbers: **59** at start (10+15+13+21). Fixing the listing gives 69, replying to the allergy review gives 76, and fixing all four gives 83.

### Fix-it (two levels)
- The list shows "รอแก้" (jobs from `lib/content/fixit.ts`, one per issue id), then "เครื่องมือช่วยร้าน", then "แก้แล้ว".
- `?job=<issue id>` opens one fix:
  - Listing jobs: a marketplace-style product card, "now" and "Merchie suggests", plus "what changed" with citations.
  - Reply jobs: a marketplace-style review card. The owner's draft goes through the guardrail cuts, and the polished reply appears in the seller-response box.
- A fix plays the cloud wipe with "score X → Y", then returns to the list.
- `?tool=` opens one of three tools:
  - `tax` (เมฆทอง): estimate from typed revenue, flat 60% or actual expenses, deductions, Merchie tips, deadlines with countdown, documents to keep. Not tax advice.
  - `crisis` (เมฆทอง): spike summary, copyable statement with guardrail notes, 24-hour checklist.
  - `checker` (free, 10 checks/month on ฟรี): paste ad copy, press ตรวจ, risky phrases highlighted with citations.

### Shield (เมฆทอง)
- Gated by `ProGate`: the screen shows blurred behind a sticky, centred offer card.
- When unlocked, Shield works as both a log and a help desk:
  - If suspended: a case card with the escalation ladder and the appeal sheet (bilingual letter, evidence, copy).
  - **"มีปัญหาอะไร" help list** (`lib/content/shield-help.ts`), four cases. Each gives a draft document, evidence auto-attached from the Vault, next steps and citations:
    - Suspension: goes to the appeal sheet.
    - Customer complaint or OCPB report.
    - Trademark or counterfeit claim (Trademark Act s.110).
    - Payout held: complaint to the platform, then ETDA.
  - **Evidence Vault** timeline. Session fixes show up here.
  - **Export** sheet (`components/shield/help-and-export.tsx`): choose 7 days, 30 days or all, then download real files made in the browser. CSV (UTF-8 BOM so Excel reads Thai), JSON, or a .txt summary report.

### Shop tab
- Shop avatar (SAISAI logo SVG) and the plan badge (tap to open the plan sheet).
- "Monthly score" card: the score per month, with the current month live. The sheet has a chart and a table.
  - ฟรี sees only this month vs last month. Paid plans get everything else: verdict, benchmark, weakest part and target, 12-month chart and table.
- Platforms (official Simple Icons glyphs; Lazada is still a stand-in), Merchie looks (PRO lock and Try sheet), props toggle, language, dark mode, plan.
- **Sales figures were removed** from the UI: revenue from platform APIs may not be accurate enough.

### Plans (demo)
- See "This session" above. "ลองเลย" calls `upgrade(need)`; the demo panel can switch plans directly.
- Paid looks keep their เมฆเงิน badge after unlocking.

### Chat (เมฆเงิน)
- Floating Merchie button at the bottom right (hidden on Fix-it).
- A keyword "brain" in `lib/content/chat-brain.ts` answers from shop state. It always cites, and its guardrail refuses threats, shaming and data exposure.
- No live AI provider yet.

## Data
- Mock Shopee-shaped JSON lives in `mock/shopee/*`. Merchie's own data is in `mock/merchie/shop.json`: platforms, checklist, YTD revenue for VAT, and `score_history`.
- Citations are in `lib/legal/citations.ts`. Entries with `review: true` (section numbers, the tax rules) need a lawyer or accountant to check them before the pitch.

## Open questions
1. **Claude API for chat and Fix-it.** This needs an Anthropic key and a server route. CLAUDE.md says to ask first, and the owner hasn't answered yet.
2. ~~Commit~~ **Done by the owner:** committed and pushed to GitHub. Keep committing only when the owner asks.
3. **Score name.** Proposed: Shop Pulse (ชีพจรร้าน, recommended), Glow, Merchie Score, Shop Vitals, Aura. Avoid "Trust Score" (phase 3) and anything with "credit".
4. **Business part and VAT.** The "business" part (25 pts) and the VAT checklist still use revenue. If revenue isn't reliable: let the shop enter YTD revenue itself, or measure business health with returns or cancellations instead.
5. ~~FC Minimal font~~ Tried, then **reverted to Anuphan** at the owner's request. Files remain in `app/fonts/` but are not loaded.
6. **PWA and deploy.** Vercel deploy is in progress (GitHub import by the owner). Still not done: `app/manifest.ts`, the real app icon and maskable icon (prompt ready in `docs/brand/app-icon-prompt.md`), iOS splash, and screenshots of the desktop view with the production QR.
7. **Peer benchmark** in monthly insights is mock data. A real one needs enough Merchie shops per category, aggregated anonymously.
8. **Verify on a real iPhone:** the speech bubble no longer uses `backdrop-filter` with `clip-path` (Safari drew a square box); confirm it now looks right on iOS Safari.
