# Merchie

Merchie is a prototype for the Chula LegalTech Y8 competition. It gives online shops (Shopee / Lazada / TikTok Shop / IG) a daily "Shop Health" score and an AI legal assistant.

Full product context: @docs/merchie-brief.md
Current state of the build (what's done, what's open): @docs/progress.md. **Update it at the end of every session.**

## What to build (prototype)
Build the 3 core features only:
1. **Shop Health:** one main score ring (WHOOP-style battery). Tapping it shows the 4 parts that make up the score (legal / platform / image / business). Plus alerts and a Legal Checklist.
2. **Fix-it:** a list of everything to fix, opened one at a time.
   - AI rewrites risky listings and drafts customer replies, with legal guardrails.
   - Also hosts shop tools: tax (PRO), crisis (PRO), and a copy checker.
3. **Shield:** an Evidence Vault plus generated appeal documents.

Demo first: everything should support the "skin cream shop on Shopee" demo story in the brief.

## Rules
- **Data access:**
  - Use official platform APIs with seller OAuth only. Never scrape.
  - Until API access is approved, use mock data shaped like the real Shopee Open Platform responses: account_health, product comments, orders, returns.
- **Legal output:**
  - Every legal flag or suggestion must cite the law or platform-policy clause it relies on.
  - Show a "not legal advice" note on legal outputs.
- **Reply guardrail:** never output replies that threaten customers, expose customer personal data, accuse customers, admit fault beyond the facts, or deny statutory rights.
- **Colors:**
  - Health-status colors (green #2FBF71 / amber #FFB547 / red #FF5D5D) must stay separate from brand blues.
  - Use ocean #1B6FD8 for buttons and text on light backgrounds.
- **Bilingual (TH/EN):** every UI string goes through `useLang()` from `lib/i18n.ts`.
  - Write inline UI copy as `t("ไทย", "English")`.
  - In content files, use `{ th, en }` objects built with `l()` from `lib/i18n-core.ts`, and render them with `tr()`.
  - Marketplace data stays in its original language: product names, listing text, and customer reviews.
  - Data files and server components import only from `lib/i18n-core.ts`. They must never import a `"use client"` module, because what they get is a client reference, not the value.
- **Language:** UI copy is in Thai, friendly tone. The mascot is called **น้อง Merchie** (a blue cloud). It speaks in alerts and the morning brief.
- **No emoji anywhere in the UI.** Never use system or OS emoji. Use Lucide icons or custom SVG instead.

## Design direction
- Modern, minimal, rounded, and easy to use. Reference apps: Calcu, เหมียวจด.
- Use as little text as possible. Show only the numbers and words that matter, and put explanations one tap deeper (in a bottom sheet).
- **Avoid "AI-generated UI" tells.** The owner explicitly dislikes these:
  - Status chips, pills, or badges of any kind, and colored bars under numbers. **The ring is the app's status language** (WHOOP-style): arc length is the value, stroke color is the status. Use it at every size, from the hero ring and score cards down to a 26px usage meter. Urgent list rows get a thin status-colored ring around their product thumbnail.
  - Text labels under tab-bar icons. The tab bar is icon-only, with aria-labels.
  - An icon inside a pastel tinted square at the start of every row or card. Use real content instead, such as a product thumbnail, a number, or a date, or show nothing at all.
  - Filler microcopy: taglines, eyebrow labels, subtitles that repeat the title, and small gray captions scattered around.
  - The "not legal advice" note appears only once, at the bottom of a legal detail sheet. Never put it on overview screens.
  - **Never use the middle dot "·" (interpunct) as a separator in UI text.** Put each piece of information on its own line or in its own element. Avoid bullet dots in front of tips as well.
- **Type scale:** keep it compact, like IG or other iOS apps.
  - Text sizes:
    - body / row titles: 15px
    - secondary: 13px
    - captions: 12px
    - section titles: 17px
    - page title in the header: 28px (iOS large-title style)
    - sheet titles: 19px
    - hero score: 56px
  - Pill buttons are 48px tall and product thumbnails are 48px.
  - Do not go back to 16–17px body text.
- **Themes:** every UI color comes from tokens in `app/globals.css`. Never hardcode `bg-white` or hex colors in UI chrome.
  - `<html data-accent>` follows Merchie's look:
    - jelly / classic → blue
    - money → green
    - fantasy → yellow
    - rainbow → violet (top tier only)
  - `data-theme="dark"` swaps the neutrals.
  - Accent greens and golds are deliberately deeper than the status green and amber. Status colors keep their meaning in every theme.
- **Motion budget:**
  - Tab changes use a subtle slide.
  - The cloud-wipe transition (`useCloudTransition`) is reserved for special events: the splash, jumping to a fix, a fix that raises the score, and a suspension.
  - Do not use the cloud wipe for ordinary taps.
- **Shop feel:**
  - Show where data comes from: platform marks (`PlatformLogo`), the badge on each product thumbnail, and the "กำลังเฝ้า" monitor strip.
  - Use real product thumbnails rather than icons.
- Stay on-brand with the CI palette in the brief. Small additions are fine (for example tints of the brand blues), but keep them restrained.
- **Mascot:** reference art is at `docs/brand/merchie-reference.jpg`.
  - A soft blue gradient cloud with two plain black dot eyes (no white sclera; the owner prefers this minimal look), peeking.
  - No mouth. Expressions come from the eyelids, pupils, and brows.
  - It must feel cute and interactive: blinking, eyes that follow touch, squish on tap, and spring physics. Use 2.5D (layered gradients and parallax) rather than a real 3D engine.

## Tech stack (decided)
- **Next.js (App Router) + TypeScript + Tailwind CSS**, built as a **mobile-first web app** (PWA). There is no native app.
- **UI kit:**
  - shadcn/ui, with Drawer (vaul) for bottom sheets
  - Konsta UI is optional, for iOS-style list, navbar, and tab bar
  - Lucide icons
  - framer-motion for transitions
- **Font:** Anuphan for all UI text; Fredoka for the score numerals. FC Minimal was tried and reverted at the owner's request (files kept in `app/fonts/`, not loaded).
- **Package manager:** npm.
- **Data:** static mock JSON in the repo, shaped like Shopee Open Platform responses. No login in the demo.
- **Alerts:** LINE Messaging API, through the LINE OA morning brief and urgent alerts. Only a simulated connect page exists (`components/shop/line-sheet.tsx`); do not call the real LINE API until asked.
- **Deploy:** Vercel, with a QR code that links to the production URL.
- **Plans (3 tiers):** ids `free` / `plus` / `pro` in code, shown as **Check up / Care / Coach** via `PLAN_NAME` / `PLAN_SHORT` in `lib/plans.ts`. Never hardcode plan names in copy; render `tr(PLAN_NAME[id])`. Badges: Check up plain, Care silver, Coach gold, no icon.
  - Gate with `useDemo().has(need)`, `ProGate need=…`, or `PlanOffer need=…`. Every "Try" goes through the plan popup (`useTryPlan()` / `usePlanPicker()`); never upgrade directly from a button.
  - Check up: health score (4 rings), 1 platform, says where the problem is, basic checklist, 10 copy checks/month.
  - Care: health score analysis (breakdown "why", issue steps/citations), customer insight (platform monitor insight), more platforms, Fix-it jobs, LINE, unlimited checks, chat, all looks, 12-month history.
  - Coach: Live analysis, Script check, CF data, Shield, appeals, Crisis, tax, multi-shop/admins, Rainbow look.
  - Never claim more than the app does today (no "coming soon" features, no partner-lawyer network, no response-time promises).
- **AI features** carry `AiMark` (a single sparkle icon, no text, never a pill). The chat is "ถาม Merchie AI".
- **Hero ring** is split into 4 arcs (legal, platform, reputation, business; clockwise from 12 o'clock), each out of 25; each part's score sits just outside its own arc with a tiny label (`components/health/segmented-ring.tsx`). The speech bubble sits above the ring so it never hides a segment.
- **Score color:** red only below 30. Above that, ring and numbers blend continuously from amber (30) to green (85) via `scoreColor` / `scoreInk` in `lib/health/status.ts`.
- **Mascot props** float beside Merchie (no hands; the owner disliked the hands). They are drawn as glossy 3D-icon objects in `components/mascot/props.tsx`.
- **Ask before adding:**
  - a database: Supabase is the candidate, needed only once Evidence Vault must persist
  - an AI provider for Fix-it
  - any backend service

## Mobile-feel rules
The goal: when someone scans the QR and the app opens in a phone browser, it must feel like a native app, not a website.

**Layout**
- App shell: a fixed top header, a fixed bottom tab bar, and only the middle content scrolls.
  - Tabs: หน้าหลัก / แจ้งเตือน / Fix-it / Shield / ร้าน
- Use `h-dvh`, never `h-screen`.
- Respect safe areas with `env(safe-area-inset-*)` and `viewportFit: "cover"`.
- Tap targets are at least 44px. Use rounded cards.
- No website patterns: no top nav links, footer, hover menus, or breadcrumbs.

**Touch behavior**
- Buttons give press feedback with `active:scale-95`. Never rely on hover.
- Open details in bottom sheets, not centered modals.
- Disable web behaviors:
  - `overscroll-behavior: none`
  - `-webkit-tap-highlight-color: transparent`
  - `touch-action: manipulation`
  - `user-select: none` on UI chrome
  - inputs at least 16px, so iOS does not zoom
  - `maximumScale: 1`

**Motion**
- iOS-style slide transitions between pages.
- The score ring animates in on load.
- The mascot's expression changes with the score.
- Use skeletons instead of spinners.
- Show toasts from the top, styled like notifications.

**Desktop**
- When the viewport is wider than about 500px, render the whole app inside a centered phone frame.
- The frame has a fake status bar, a hidden scrollbar, and a brand-blue background.
- Beside the frame, show the mascot, a tagline, and a "สแกนเพื่อลองบนมือถือ" QR code.
- Use the same code path. Only the wrapper changes.

**PWA extras**
- `app/manifest.ts` with `display: "standalone"`.
- The cloud mascot as the app icon, including a maskable version.
- `appleWebApp: { capable: true, statusBarStyle: "black-translucent" }`, apple-touch-icon, and an iOS splash screen.
- This lets the team's demo phone install the app full screen. Judges just scan and use it in the browser, so installing must stay optional.
- A real web dashboard (sidebar layout) for Tier 2 is out of scope for the prototype.
