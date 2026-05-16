# Handoff: AInterview — MVP UI

> Design pack for the AInterview adaptive AI-interview web app.
> Target codebase: React + Vite + TypeScript + (Fastify API + Prisma + Postgres).
> Built for a developer using Claude Code / Cursor / similar.

---

## Overview

AInterview is a web app where users:
1. Browse / create **interview templates** (rubrics + system prompts).
2. Run **voice-first adaptive interviews** — the AI decides between 3–12 questions, stops when it has enough signal, and the user can also end early.
3. Get a **scored result** with strengths, weaknesses, and follow-up suggestions.

This handoff covers **the front-end MVP** — design tokens, six core components, seven core screens, three variations of the two highest-value screens (Interview Session and Result), and a states gallery (loading / empty / error / mobile behavior).

---

## About the design files

> ⚠️ **The HTML files in this bundle are *design references*, not production code.**
>
> They are static prototypes built with React + Babel + plain CSS so they could render in a browser preview. **They are intended to be re-implemented in the target codebase** (`apps/web`, React + Vite + TypeScript) using your established patterns — your component library, your styling solution, your routing.
>
> Don't ship `styles.css` or `ui.jsx` as-is. **Lift the design decisions from them** — tokens, layout, copy, behavior — and re-express them in production code.

---

## Fidelity

**High-fidelity.** Exact colors (OKLCH), spacing, typography, copy, layout, micro-interactions are all locked. Use them as the visual contract.

The two screens with explicit variations (Interview Session and Result) are alternatives — the team should pick one direction per screen before implementing. Recommendations:

- **Interview Session → A · Calm transcript** is the safest first build; B & C can come later as power-user / mobile / fullscreen modes.
- **Result → A · Editorial summary** matches the "strengths / weaknesses / suggestions" emphasis you asked for. B is a richer secondary view; C is the special-case "user_stopped" layout.

---

## Tech-stack expectations

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | CSS variables (tokens) + CSS Modules **or** Tailwind preset built from `tokens.css`. Avoid styled-components — tokens are CSS-native. |
| Fonts | `Geist` + `Geist Mono` via `@fontsource/geist-sans` + `@fontsource/geist-mono` (or Google Fonts link) |
| Icons | Inline SVG (24×24, 1.6 stroke). The icon set in `ui.jsx` covers everything used. Lucide-react is fine as a drop-in if you prefer. |
| State | React Query for server data + Zustand or React context for session state. Session screen needs local audio state + WebSocket-ish polling. |
| Routing | TanStack Router or React Router 6 — protected route wrapper required (see API spec). |
| Forms | React Hook Form + Zod schemas matching the API. |

---

## Design tokens

All tokens live in `styles.css` as CSS custom properties under `:root`. Copy that file in as `src/styles/tokens.css` and import once in `main.tsx`.

### Colors (warm-neutral palette · mustard accent)

```css
--bg:        oklch(0.975 0.012 78);   /* page cream */
--surface:   oklch(1 0 0);            /* card white */
--surface-2: oklch(0.965 0.013 78);   /* sunken */
--surface-3: oklch(0.945 0.015 78);   /* deeper sunken */
--tint:      oklch(0.955 0.018 78);   /* warm wash */

--ink-900:   oklch(0.22 0.012 60);    /* primary text — warm near-black */
--ink-800:   oklch(0.30 0.012 60);
--ink-700:   oklch(0.42 0.012 60);
--ink-600:   oklch(0.55 0.012 60);
--ink-500:   oklch(0.65 0.012 60);    /* muted */
--ink-400:   oklch(0.78 0.012 70);    /* placeholder */
--ink-300:   oklch(0.88 0.014 75);    /* hairline */
--ink-200:   oklch(0.93 0.014 75);    /* border */
--ink-100:   oklch(0.965 0.012 78);

--acc:       oklch(0.74 0.13 78);     /* mustard — voice flow CTAs only */
--acc-deep:  oklch(0.55 0.12 70);     /* on cream backgrounds */
--acc-soft:  oklch(0.93 0.06 85);     /* wash / focus halo */

--ok:        oklch(0.62 0.11 150);    /* sage green */
--ok-soft:   oklch(0.94 0.05 150);
--warn:      oklch(0.72 0.13 70);
--err:       oklch(0.58 0.16 28);     /* terracotta */
--err-soft:  oklch(0.94 0.05 28);
```

**Usage rules:**
- `--acc` (mustard) is **only** for the voice flow — record buttons, "AI completed" chip, score gauge fills above 70. Never for generic CTAs.
- Generic primary CTAs use `--ink-900` (warm near-black on surface).
- Recording state inverts to `--ink-900` background — this is the single most important affordance in the product.

### Typography

Geist (sans) + Geist Mono. Mono is used for numerals/IDs/durations (with `font-variant-numeric: tabular-nums`).

```
display  36/40   weight 500   tracking -0.025em
h1       26/30   weight 500   tracking -0.022em
h2       19/24   weight 500   tracking -0.015em
h3       15/20   weight 600   tracking -0.01em
body     13.5/21 weight 400   tracking -0.005em
small    12/18   weight 400
micro    11/15   weight 500   tracking 0.08em  upper
mono     13/18   weight 500   Geist Mono
```

### Spacing scale (8-based with two off-grid steps)

`2xs 4 · xs 6 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · 3xl 48`

### Radius

`xs 4 · sm 6 · md 10 (buttons/inputs) · lg 14 (cards) · xl 20 (hero) · 2xl 28 · pill 999`

### Shadows

```css
--shadow-xs:  0 1px 0 rgba(ink, .06);                                /* list rows */
--shadow-sm:  0 1px 2px rgba(ink, .06), 0 1px 0 rgba(ink, .04);      /* cards (default) */
--shadow-md:  0 4px 14px rgba(ink, .07), 0 1px 0 rgba(ink, .04);     /* floating chips */
--shadow-lg:  0 18px 40px rgba(ink, .10), 0 2px 6px rgba(ink, .05);  /* modals */
--shadow-pop: 0 24px 60px rgba(ink, .14);                            /* menus */
```

---

## Components

The spec lists six components. Build each as a typed React component in `src/components/`. Below — public API + exact visual behavior.

### 1. `<Button />`

```ts
type ButtonProps = {
  kind?: 'primary' | 'accent' | 'ghost' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
};
```

- **primary** — `--ink-900` bg, `--surface` text. Default CTA everywhere except voice flow.
- **accent** — `--acc` bg, `--ink-900` text. Reserve for record buttons and "start interview".
- **ghost** — transparent bg, 1px `--ink-200` border, `--ink-800` text. Secondary actions.
- **quiet** — transparent bg, no border. Cancel / back / tertiary.
- **danger** — `--err` bg, white text. End session / destroy.
- Sizes: `sm` 28px, `md` 36px, `lg` 44px. Padding `0 10/14/18px`. Radius `sm/md/lg`.
- Icons sit left or right with 8px gap. Both = side-by-side flanking.
- Active: `translateY(0.5px)`. Hover: bg shifts one step (see CSS).
- Disabled: opacity .45, `pointer-events: none`.

### 2. `<Input />` + `<Field />`

```ts
type InputProps = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  icon?: IconName;      // leading
  suffix?: ReactNode;   // trailing text/badge
  size?: 'md' | 'lg';   // 38px / 44px
  type?: 'text' | 'email' | 'password';
  error?: boolean;
  disabled?: boolean;
};

type FieldProps = {
  label?: string;
  hint?: string;
  error?: boolean;     // colors hint red
  optional?: boolean;  // shows "Optional" in label row
  children: ReactNode;
};
```

- Default: 38px tall, 1px `--ink-200` border, radius `md`, bg `--surface`.
- Focus: border `--ink-900`, 3px halo `oklch(0.22 0.012 60 / .08)`.
- Error: border `--err`, halo `--err-soft`.
- Disabled: bg `--surface-2`, text `--ink-500`.
- Field hint sits under input at 11.5px `--ink-500`; turns `--err` when `error`.

### 3. `<TemplateCard />`

```ts
type TemplateCardProps = {
  template: {
    id: string;
    title: string;
    author: { name: string; avatarTone?: 'a'|'b'|'c'|'d'|'e' };
    category: 'Engineering'|'Product'|'Design'|'Founder'|'Data'|'Sales';
    likeCount: number;
    questionRange: [number, number];   // e.g. [6, 8]
    isLiked?: boolean;
    trending?: boolean;
  };
  onLike?: () => void;
  onClick?: () => void;
};
```

- 16px padding, radius `lg`, bg `--surface`, border `--ink-200`, `--shadow-xs`.
- Top row: category chip (accent variant for Engineering, ok for Product), trending micro label right.
- Title: 15.5px / 500 weight / `text-wrap: pretty`.
- Author row: 22px avatar + small text.
- Bottom row separated by 1px `--ink-100`: question range in mono left, heart + like count right (filled `--err` when liked).
- Clickable whole card; hover lifts to `--shadow-sm`.

### 4. `<AudioRecorder />`  ⭐ critical component

```ts
type AudioRecorderState = 'idle' | 'recording' | 'review' | 'processing';

type AudioRecorderProps = {
  state: AudioRecorderState;
  durationSec?: number;            // current recording length
  maxSec?: number;                 // default 180 (3 min)
  onStart: () => void;
  onStop: () => void;
  onSubmit: () => void;
  onPlayback: () => void;
  onReRecord: () => void;
  device?: { name: string; levelOk: boolean };
};
```

Four visual states (see `components.jsx → AudioRecorder`):

| State | Behavior |
|---|---|
| `idle` | Cream/white card. Single large accent button: "Record answer" with mic icon. |
| `recording` | **Card inverts to `--ink-900` background**, white text. Pulsing red dot + "Recording · 0:42" in mono uppercase. Live waveform bars in `--acc`. Big danger button "Stop". |
| `processing` | Cream card. Dot row pulsing + "Sending to speech service…" + elapsed seconds. |
| `review` | Cream card. Ghost buttons "Play back" + "Re-record" + primary "Submit". |

Wire to MediaRecorder API. Upload to `POST /sessions/:id/answer` as multipart audio. While `processing`, disable submit. On STT error, show inline error banner above the recorder (don't replace it) so the audio isn't lost.

### 5. `<SessionProgress />`

```ts
type SessionProgressProps = {
  current: number;        // 1-indexed
  plannedTotal: number;   // AI's target inside [min, max]
  min?: number;           // default 3
  max?: number;           // default 12
};
```

Renders `max` small dots in a row. Filled dots = answered, ring-style dot = currently active, the rest hollow. A small vertical notch sits after the `min`-th dot — this is the AI's earliest finish point. Labels above: "Q4 of est. 6 · 3–12 range". Labels below: "AI may end after Q3 / Hard cap Q12".

### 6. `<ResultSummary />`

```ts
type ResultSummaryProps = {
  score: number;                                          // 0–100
  completionReason: 'ai_completed' | 'user_stopped' | 'failed';
  headline: string;                                       // AI-generated
  strengths: string[];                                    // 2–4 items
  improvements: string[];                                 // 2–4 items
  questionCount: number;
  duration: string;                                       // "11m 32s"
  onRetry: () => void;
  onTranscript: () => void;
  onExport: () => void;
};
```

Top card with **score gauge** (conic-gradient ring, see CSS `.gauge`), headline, completion chip, meta. Two columns underneath: green Strengths / red Improvements (bulleted, body text). Action row at bottom.

---

## Screens

All seven screens. Desktop-first. Layouts assume 1280px design width; everything scales down with a max-width wrapper at 1440px and stacks at <720px.

### App shell (used by all logged-in screens)

- **Sidebar** (232px) — wordmark top, nav items, "Practice" + "Account" groups, user card at bottom.
- **Topbar** (56px) — breadcrumb OR title, centered search (`⌘K`), bell + avatar right.
- **Main** — 28/32 padding, `overflow-y: auto`. Uses CSS grid for two-column layouts.

### 1 · Login / Register (`/login`, `/register`)

Two-column split. Left = `--ink-900` marketing pane (wordmark, 42px display headline, value-prop checklist). Right = form (380px max, centered vertically) with a pill tab switcher at top for `Sign in / Create account`. Email + password (with show toggle as suffix), submit button, "or" divider, OAuth row (Google + GitHub ghost buttons), legal microcopy.

Auth state: stored in `localStorage` as `ainterview_jwt`. Protected route wrapper redirects unauthed to `/login`.

### 2 · Discovery (`/discover`)

Sidebar + topbar shell. Main:
1. **Hero** — eyebrow "Discover · 1,284 templates", display headline with one mustard accent word, body sub, "New template" accent button right.
2. **Category chips** — All / Engineering / Product / Design / Founder / Data / Sales. Active = `chip--ink`. Right side: Filter + Sort buttons.
3. **Featured banner** — `--ink-900` card, editor's pick, faded waveform decoration right, "Start" accent button.
4. **Section header** — "Trending in Engineering" + timestamp + "See all".
5. **Card grid** — 4 columns of `<TemplateCard />`.

Data flow: `GET /templates?category=engineering&sort=trending`. Infinite scroll or "Load more" — pick infinite.

### 3 · Template Detail (`/templates/:id`)

Two-column inside main: 1fr content + 340px sticky rail.

- **Content**: breadcrumb topbar; category chips row; display title; author/date/like meta; "About this rubric" card with axis chips; "System instruction" card (mono prompt text on `--surface-2`); "Sample questions" card list.
- **Rail**: "Start interview" card (estimated count + range + primary button); Author follow card; Recent runs list.

`POST /sessions` on Start → navigate to `/sessions/:id`.

### 4 · Create Template (`/create`)

Two-column: 1fr editor + 360px sticky preview rail.

- **Editor**: stepper at top ("Step 1 of 3 · Identity"), 3 cards stacked — Identity (title/category/seniority/description), System Instruction (textarea + axis chips with `+` add), Question Range (custom dual-slider for `[min, max]` within `[3, 12]`).
- **Preview rail**: live `<TemplateCard />` preview + visibility radio (Public / Unlisted).

Form: React Hook Form + Zod. Validation matches Prisma schema. Save draft → `POST /templates/draft`, Publish → `POST /templates`.

### 5 · Interview Session — **3 variations, pick one** ⭐

All variations share a header (`SessionHeader`): wordmark, template name, session ID in mono, **inline `<SessionProgress />`**, elapsed time, "End early" button (calls `POST /sessions/:id/finish`).

#### A · Calm transcript (recommended default)

Centered 720px column. Chronological `<BubblePair>` thread — AI bubbles left-aligned cream/border, user bubbles right-aligned `--ink-900`. Current Q bubble is "highlighted" — 17px, 500 weight, accent border, 4px accent halo. Recording dock sits inline as the next item — `--ink-900` card with live waveform + danger button.

#### B · Focus mode (dark)

Full `--ink-900` background, white text. Transcript strip at top (compressed 2-col grid, role label + line). Center stage: question chips ("Q4 of est. 6", axis), 30px headline (the question), large 88-bar waveform in accent, "Recording · 0:42" mono. Bottom dock: round skip / huge accent stop-and-submit pill / round pause.

#### C · Split + live rubric

Same header. 1fr conversation column + 320px right rail showing the **live rubric coverage** (6 bars updating after each turn). "Why this question" card explaining the AI's next-question reasoning. "Finish now & score" button at bottom of rail.

**Audio handoff for all variants:** use MediaRecorder, accumulate chunks, on stop POST as multipart. While the request is in flight, show the `processing` state of the recorder. On success: server returns either `{ status: 'continue', nextQuestion: {...} }` or `{ status: 'finished', result: {...} }` — route accordingly.

### 6 · Result — **3 variations, pick one**

All variants share the topbar with Export + Try again buttons.

#### A · Editorial summary (recommended default — matches the "text-heavy strengths/weaknesses" spec)

Two-column 1fr + 320px rail. Content: display headline ("Solid signal, room to land outcomes."), hero card (gauge + summary + delta-vs-last-run), four "What landed" cards (green check icon, title, body), three "What to sharpen" cards (red bolt icon, title, body, CTA). "Run follow-up" call-out at bottom. Rail: rubric axes mini-bars + session meta.

#### B · Rubric breakdown (chart-forward alt)

Single column. Hero row (large gauge + headline + chips). Big "Rubric breakdown" table with bar visualization per axis + strongest moment quote. Two-up under: Q-by-Q timeline + Recommended drills.

#### C · Coach (used when `completionReason === 'user_stopped'`)

Centered 720px column. "You ended early" chip, display headline acknowledging the early stop. AI coach bubble (long-form). Partial score card (gauge at 62, only filled chips for covered axes). Three sections (What landed / Where I lost signal / Try this next) as bordered cards. CTA: "Run 3-question follow-up".

**Route Result page based on `completionReason`:** show C if `user_stopped`, else default to A. B is opt-in via a tab toggle.

### 7 · Profile (`/users/:handle`)

Sidebar + topbar shell. Profile header card (XL avatar + bio + counts + Follow/Message/More). Tabs: Templates · Liked · Followers · Following. Below tabs: card grid (3 columns).

Self-profile: own avatar/name shown; Follow button replaced with "Edit profile". Block self-follow on the API as well.

---

## States

### Loading
- **Lists** → skeleton cards matching real card structure. Never spinners. Shimmer animation 1.6s.
- **AI thinking** → inline dot-row "AI is choosing the next question…" with current Q counter.
- **STT processing** → inline waveform bar + "Transcribing your answer with Deepgram" + elapsed.

### Empty
- **No sessions / no templates** → 56px iconographic placeholder, h3, body explaining what's possible, primary + ghost action buttons.
- **No search results** → inline flush card with verb-led message + "Create" shortcut.

### Error
- **Inline (recoverable)** → `--err-soft` banner card with bolt icon, message, Retry button. Don't destroy user input.
- **Page (unrecoverable)** → centered icon + h3 + body + mono error code (`err_score_bad_response · sess_8k42p`) + primary action.
- **Form** → field-level red border + red hint underneath.

### Mobile (deferred; design for it second pass)

- Sidebar → bottom-sheet behind hamburger.
- Discovery → single column cards.
- Session → header collapses, large stop button stays fixed bottom-sheet, transcript scrolls above.
- Result → gauge centered, sections stacked.

---

## Interactions & micro-behavior

- **Recording**: tap mic → immediately enter `recording` (don't wait for stream — show optimistic state). On Stop, transition to `processing`. On success → next question slides in (translateY 8px → 0, opacity, 240ms ease-out).
- **Like**: optimistic heart fill on click; revert on API error with a toast.
- **Question transitions**: 240ms `cubic-bezier(.2,.7,.3,1)`. New question bubble fades up + the previous answer bubble settles into the transcript.
- **Score gauge on Result load**: animate `--p` from 0 to target over 800ms (cubic-bezier `.65,0,.35,1`).
- **Hover on TemplateCard**: shadow xs → sm; no transform — keep layout calm.
- **Sidebar item active**: instant background swap to `--ink-900`, white text.

---

## API contract reminders (from your spec)

| Endpoint | Purpose | Notes for FE |
|---|---|---|
| `POST /sessions` | Create adaptive session from template | Response: `{ sessionId, rubric, plannedQuestionCount, firstQuestion: { id, text, audioUrl } }` |
| `POST /sessions/:id/answer` | Submit audio answer | multipart `audio`. Response: `{ status: 'continue', nextQuestion } \| { status: 'finished', result }` |
| `POST /sessions/:id/finish` | User ends early | Allowed only after `turnCount >= 1`. Returns full `result`. |
| `GET  /sessions/:id` | Resume / view | Returns turns, rubric, completionReason, result if any. |

`completionReason` drives the Result variant shown:
- `ai_completed` → Result A (default)
- `user_stopped` → Result C
- `failed` → States/Error page

---

## Files in this bundle

```
design_handoff_ainterview_mvp/
├── README.md                  ← you are here
├── AInterview design.html     ← entry point — open in browser to view all artboards
├── styles.css                 ← all tokens + utility CSS (copy into src/styles/)
├── design-canvas.jsx          ← Figma-style canvas wrapper (not for prod)
├── ui.jsx                     ← primitive components (Button, Input, Avatar, Icon, Wordmark, Sidebar, Topbar)
├── tokens.jsx                 ← token preview artboards (reference only)
├── components.jsx             ← the six spec'd components + their preview cards
├── pages-core.jsx             ← Login/Register · Discovery · Detail · Create · Profile
├── pages-session.jsx          ← 3 Interview Session variations
├── pages-result.jsx           ← 3 Result variations
├── pages-states.jsx           ← loading · empty · error · mobile
└── app.jsx                    ← composes everything into the canvas
```

**Reading order for the implementing dev:**
1. Open `AInterview design.html` in the browser to see everything.
2. Read this README end-to-end.
3. Skim `styles.css` for tokens.
4. Pick a variation per spec'd screen (A/B/C).
5. Read the matching JSX file (`pages-session.jsx`, `pages-result.jsx`, etc.) for exact markup and copy.
6. Re-implement in `apps/web/src/` using your codebase's conventions.

---

## Brand

- **Wordmark**: 6 vertical bars (varying heights 4 / 9 / 14 / 8 / 11 / 5 units, 2px wide) in `--acc-deep`, followed by "AInterview" in Geist 500 weight, -0.025em tracking. Bar gap = 2px. Gap between mark and text = ~0.45 × font-size.
- The bars are not a fixed asset — they're the same voice-meter motif used during recording. Render inline with the wordmark component.
- No standalone logo file needed; recreate from spec.

---

## What's intentionally not designed yet

- Onboarding flow
- Settings page
- Notification center
- Marketing landing
- Email templates
- Mobile-native breakpoints (only behavior described, not pixel-mocked)

Ask before adding any of these — they should be designed before being built.
