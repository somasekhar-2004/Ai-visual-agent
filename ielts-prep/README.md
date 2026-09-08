# IELTS Prep

A complete, production-structured IELTS preparation app for iOS, Android, and web — built with Expo, React Native, and TypeScript.

It covers all four IELTS skills (Listening, Reading, Writing, Speaking), realistic exam-style test interfaces, a full mock test flow with an AI-generated band report, an AI Speaking Examiner and Writing Evaluator, an AI Coach chat, vocabulary and grammar training, progress analytics, gamification, push notifications, and a subscription/paywall system — and it runs **fully offline in Demo Mode with zero configuration**.

> All AI-generated band scores in this app are **practice estimates**, not official IELTS results.

## Table of contents

- [What's included](#whats-included)
- [Tech stack](#tech-stack)
- [Quick start (Demo Mode)](#quick-start-demo-mode)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [AI provider setup](#ai-provider-setup)
- [RevenueCat setup](#revenuecat-setup)
- [Free vs. Premium boundary](#free-vs-premium-boundary)
- [Development commands](#development-commands)
- [Testing](#testing)
- [Production builds (EAS)](#production-builds-eas)
- [Account deletion (Edge Function)](#account-deletion-edge-function)
- [Known limitations](#known-limitations)

## What's included

- **Onboarding** — IELTS type, current/target band, exam date, weakest skill, daily study time, notifications, account creation, and a generated study plan summary.
- **Home dashboard** — target vs. predicted band, per-skill bands, today's study plan, streak/XP, recommended mock test, recent activity, weak-area callout, and a floating AI Coach button.
- **Learn** — structured lessons per skill (strategy, question types, time management), plus dedicated Grammar and Vocabulary sections.
- **Practice** — unlimited, filterable question practice (skill/difficulty/type) with instant feedback, explanations, bookmarks, and "retry incorrect."
- **Reading test** — passage + question panes, countdown timer, question navigator, flag-for-review, tap-to-highlight, notes, submit confirmation, and a scored report with a band estimate.
- **Listening test** — section-based audio (real files if provided, else on-device text-to-speech in Demo Mode), question navigator, and a scored report with transcript-based review.
- **Writing test** — timed Task 1/Task 2 interface, live word counter, autosave, and AI evaluation across all 4 IELTS Writing criteria with strengths/weaknesses/suggestions and an improved example.
- **AI Speaking Examiner** — Part 1/2/3 flow with TTS-spoken questions, cue-card prep timer, audio recording, transcription, and AI evaluation across all 4 IELTS Speaking criteria.
- **Full mock test** — chains Listening → Reading → Writing (x2) → Speaking into one timed flow with autosave/resume, ending in a full band report (per-skill + overall, strongest/weakest skill, readiness score, recommendation).
- **AI Coach** — a context-aware chat that knows the user's goals, band history, and weak areas, with suggested prompts and conversation history.
- **Vocabulary & Grammar** — 11 topic word packs with flashcards, a spaced-repetition review ladder, and a quiz mode; targeted IELTS grammar lessons.
- **Progress & Analytics** — predicted band trend, weekly activity, accuracy, and question-type breakdowns.
- **Gamification** — streaks, XP, and achievements.
- **Notifications** — daily reminder, streak reminder, exam countdown, and weekly summary (local scheduled notifications).
- **Subscription/Paywall** — Free vs. Premium gating with a RevenueCat abstraction (mock purchases when RevenueCat isn't configured).
- **Demo Mode** — the entire app works offline, seeded with a demo user ("Alex") and realistic content, no backend or API keys required.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Expo (SDK 57) + React Native + TypeScript (strict) |
| Navigation | Expo Router (file-based) |
| Data/state | TanStack Query + Zustand |
| Forms/validation | React Hook Form + Zod |
| Backend | Supabase (Postgres, Auth, RLS) — optional, see Demo Mode |
| AI | Pluggable provider abstraction — mock (default), OpenAI, or Anthropic |
| Payments | RevenueCat abstraction — mock (default) or real |
| Speech | `expo-speech` (TTS) + `expo-audio` (recording/playback) |
| Testing | Jest (`jest-expo`) |

## Quick start (Demo Mode)

No API keys, no Supabase project, no RevenueCat account needed.

```bash
cd ielts-prep
npm install
npm run start
```

Press `i` / `a` / `w` in the Expo CLI to open iOS Simulator, Android Emulator, or web, or scan the QR code with Expo Go on a physical device (note: `expo-audio` recording and `expo-notifications` require a [custom dev client](https://docs.expo.dev/develop/development-builds/introduction/) rather than Expo Go for full functionality — everything else works in Expo Go).

On first launch, choose **"Continue with Demo Mode"** during onboarding (or on the sign-in screen). This seeds a demo profile ("Alex", Academic, target Band 7.5, exam in 42 days) and stores all progress on-device via `AsyncStorage` — see `lib/demoStore.ts`.

## Project structure

```
app/                  Expo Router screens (file-based routing)
  (onboarding)/        Onboarding wizard
  (auth)/              Sign in / sign up / forgot password
  (tabs)/              Home, Learn, Practice, Tests, Profile
  learn/, lesson/, grammar-lesson/   Learn detail screens
  reading-test.tsx, listening-test.tsx, writing-test.tsx, speaking-session.tsx
  mock-test.tsx, mock-result.tsx    Full mock test orchestration + report
  ai-coach.tsx, vocabulary*.tsx, analytics.tsx, achievements.tsx, paywall.tsx, ...
components/            Reusable UI (components/ui), feature components
constants/             Design tokens (colors, spacing, typography, radius, shadows)
hooks/                 useTheme, useCountdown, useVoiceRecorder, ...
lib/                   Pure logic: bandScore, answerChecking, textAnalysis, content/*, demoStore, env
services/              Data access (services/repository), AI (services/ai), purchases, auth, notifications
store/                 Zustand stores (useAppStore, useOnboardingStore)
types/                 Shared domain types (mirrors the Supabase schema)
supabase/              SQL migrations + seed data
scripts/               DB migration/seed runner scripts (Node + pg)
__tests__/             Jest unit tests
```

**Content model:** all lessons, questions, passages, listening tracks, writing prompts, speaking topics, vocabulary, and grammar lessons live in `lib/content/*.ts` — the single source of truth. When Supabase is configured, `services/repository/*.ts` reads/writes the database instead; when it isn't, the same functions read the bundled content and read/write `lib/demoStore.ts`. Every screen calls through `services/repository`, so switching between Demo Mode and a real backend requires no screen changes.

`supabase/seed/0002_generated_content.sql` is auto-generated from `lib/content/*.ts` by `scripts/generate-seed-sql.ts` — it is never hand-edited. After adding or changing any content file, run:

```
npm run seed:generate   # regenerates supabase/seed/0002_generated_content.sql
npm run db:seed          # applies it (requires DATABASE_URL)
```

This keeps the TypeScript content and the SQL seed data from drifting as the library grows — adding a new reading passage, mock test, or speaking topic group only ever means editing `lib/content/*.ts`.

## Environment variables

Copy `.env.example` to `.env` and fill in whatever you have — every value is optional:

```bash
cp .env.example .env
```

See `.env.example` for the full list and comments. In short:

- **Nothing set** → Demo Mode (default, no backend).
- **`EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`** → real backend.
- **`EXPO_PUBLIC_AI_PROVIDER=openai|anthropic` + matching API key** → real AI evaluation/coach.
- **`EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY`** → real subscriptions.

Restart the Expo dev server after changing `.env` (`EXPO_PUBLIC_*` vars are inlined at build time).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API) to `.env`.
3. Add `DATABASE_URL` (Project Settings → Database → Connection string → URI) to `.env` — used only by the migration/seed scripts below, never shipped to the app.
4. Run the migration (creates all tables, enums, indexes, and Row Level Security policies):
   ```bash
   npm run db:migrate
   ```
5. Seed reference content and the demo user:
   ```bash
   # Optional, for the "Alex" demo auth user — Project Settings → API → service_role key.
   # NEVER prefix this with EXPO_PUBLIC_ or ship it in the app.
   echo "SUPABASE_SERVICE_ROLE_KEY=..." >> .env
   npm run db:seed
   ```
6. Restart `npm run start`. The app now reads/writes Supabase instead of Demo Mode.

The schema (`supabase/migrations/0001_init.sql`, plus `0002_content_expansion_schema.sql` for mock test numbering/difficulty and writing chart data, and `0003_grammar_practice.sql` for grammar practice questions/attempts) covers every table in the product spec: profiles, goals, lessons/progress, questions/attempts, passages, listening tracks, mock tests/sections/attempts, reading/listening attempts, writing submissions/feedback, speaking sessions/responses/feedback, band scores (with a configurable raw-score → band conversion table), study plans/items, vocabulary + spaced repetition, grammar lessons/questions/attempts, achievements, AI conversations/messages, subscriptions, notifications, bookmarks, and test history — 38 tables total, each with RLS so users can only read/write their own rows, and public content tables (lessons, questions, etc.) readable by anyone.

**Verification status:** every table listed above has RLS enabled and at least one policy (verified with a static script comparing `create table` / `enable row level security` / `create policy` statements — 38/38 tables covered, zero gaps), every foreign key uses `on delete cascade` (or `set null` where a null reference is meaningful, e.g. a question whose passage was removed), `subscriptions.user_id` and other 1:1 tables carry a `unique` constraint so upserts behave correctly, and every `.from('table_name')` call and column name in `services/repository/*.ts` was cross-checked against the actual migration column names — no drift found. **This is static verification only.** The schema and repository layer have **not** been exercised against a real, running Supabase project in this environment (no `DATABASE_URL`/Supabase credentials are available here) — running `npm run db:migrate && npm run db:seed` against a real project and smoke-testing sign-up → onboarding → a mock attempt → a writing submission is still needed before relying on the Supabase path in production.

## AI provider setup

`EXPO_PUBLIC_AI_PROVIDER` selects the provider (`services/ai/index.ts`); if the selected provider's key is missing, it silently falls back to mock so the app never breaks.

- **`mock`** (default) — deterministic, heuristic scoring (word count, sentence variety, linking devices, filler words, vocabulary richness) that produces genuinely differentiated, useful feedback with zero setup. See `services/ai/mockProvider.ts`.
- **`openai`** — set `EXPO_PUBLIC_OPENAI_API_KEY` (and optionally `EXPO_PUBLIC_OPENAI_MODEL`, default `gpt-4o-mini`). Also enables real audio transcription (Whisper) for the Speaking Examiner.
- **`anthropic`** — set `EXPO_PUBLIC_ANTHROPIC_API_KEY` (and optionally `EXPO_PUBLIC_ANTHROPIC_MODEL`, default `claude-sonnet-5`). Anthropic has no audio transcription API, so Speaking transcription falls back to OpenAI (if configured) or the mock simulated transcript.

All real-provider outputs are validated against Zod schemas (`services/ai/schemas.ts`) before use; a malformed or failed response falls back to the mock provider's output rather than crashing or showing garbage. Every screen that shows an AI-generated score (Writing feedback, Speaking feedback, AI Coach) displays a small "Demo AI" / "Live AI" badge reflecting **that specific result's** actual source (`services/ai/index.ts`'s `aiSource` field) — not just whether a provider is configured, since a single call can still fall back to mock output on a network error even with a real provider set up. `services/ai/httpClient.ts` adds a 30s timeout (60s for audio transcription) and retries transient failures (429/5xx/network errors, up to 3 attempts with exponential backoff) before falling back, so a slow or flaky provider degrades to Demo AI rather than hanging.

**Known gap — API keys are currently client-side.** `EXPO_PUBLIC_OPENAI_API_KEY`/`EXPO_PUBLIC_ANTHROPIC_API_KEY` are, by Expo's own convention, bundled directly into the shipped app/web build and are extractable by anyone with the binary — this is **not** safe for a real production release with paid API keys. Before shipping with real AI credentials, route these calls through a server-side proxy instead (e.g. a Supabase Edge Function that holds the real key and the app calls with only the user's Supabase auth token) so the key never reaches the client. `services/ai/openaiProvider.ts` / `anthropicProvider.ts` would need their `fetch` targets pointed at that proxy instead of the provider's API directly — the retry/timeout/schema-validation logic around them stays the same either way.

## Listening audio generation

Every listening track plays out of the box via real, audible on-device text-to-speech (`expo-speech`) — no listening button is ever a no-op. For higher-quality, pre-rendered audio instead:

```bash
echo "EXPO_PUBLIC_OPENAI_API_KEY=sk-..." >> .env   # or OPENAI_API_KEY, server-side only
npm run audio:generate
```

`scripts/generate-audio.ts` reads every transcript in `lib/content/listening.ts`, synthesizes it with OpenAI's TTS API (`OPENAI_TTS_MODEL`, default `tts-1`; a different voice per section number so multi-speaker sections don't all sound the same), saves the MP3s under `assets/audio/<trackId>.mp3`, and regenerates `lib/content/audioRegistry.ts` to `require()` exactly the files that exist. `TranscriptAudioPlayer` checks that registry first and only falls back to text-to-speech for tracks it doesn't cover — so partially generating audio (e.g. only Section 1 of each mock) is fine. Re-running the script skips tracks that already have a file.

## RevenueCat setup

`services/purchases/` mirrors the AI provider pattern:

- **Unconfigured** (default) — `services/purchases/mockProvider.ts` simulates two products (monthly/yearly) and instant "purchases," clearly labeled as simulated in the paywall UI. No store setup needed to exercise the full paywall flow.
- **Configured** — set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` from the [RevenueCat dashboard](https://app.revenuecat.com) after setting up your App Store Connect / Google Play products and a RevenueCat "current" offering. `services/purchases/revenuecatProvider.ts` then loads real products dynamically (never hardcoded) via `react-native-purchases`. This requires a [custom dev client](https://docs.expo.dev/develop/development-builds/introduction/) or a real build — it will not work in Expo Go.

**Entitlement sync (cancellations/expiry):** `checkEntitlement()` re-reads RevenueCat's `CustomerInfo` directly (not whatever was last written to Supabase) and is called on app launch and every foreground resume (`app/_layout.tsx`'s `AppState` listener → `useAppStore.syncEntitlement`), so a subscription cancelled or expired in the App Store/Play Store settings is reflected without the user reopening the paywall. `checkEntitlement()`'s plan detection (`services/purchases/revenuecatProvider.ts`) assumes product identifiers containing "annual"/"year" are the yearly plan — update that check to match your actual RevenueCat product identifiers. A subscription with auto-renew turned off but not yet expired is shown as `status: 'cancelled'` with the renewal date, distinct from `'expired'` (fully lapsed → downgraded to `free`).

**Not yet sandbox-tested:** none of the above has been exercised against a real RevenueCat project or App Store/Play Store sandbox account in this environment — there is no way to do that without real store credentials and a native build. Everything is implemented and verified via `tsc`/lint/unit tests and mock-provider behavior only; a real end-to-end purchase/restore/cancel/expire flow still needs to be run on a device with a sandbox account before shipping.

## Free vs. Premium boundary

Every screen with a free/premium distinction reads `useAppStore().subscription?.plan !== 'free'` directly (no separate "entitlements" service to fall out of sync with) and, on the free plan, shows a `DailyLimitCard`/inline upsell instead of silently degrading or silently staying unlimited. The actual limits live in one place, `lib/entitlements.ts`:

| Feature | Free | Premium |
|---|---|---|
| Full mock tests | 1 Academic + 1 General (of 12) | All 12 |
| Lessons (Learn module) | Per-lesson `isPremium` flag in content | All |
| Vocabulary topics | First 4 of 20 | All 20 |
| Grammar lessons | First 6 of 40 | All 40 |
| Practice questions | 20/day | Unlimited |
| AI Coach messages | 5/day | Unlimited |
| Writing evaluations | 1/day | Unlimited |
| Speaking evaluations | 1/day | Unlimited |
| Analytics | Skill bands, target progress, accuracy/streak/question-count | + predicted-band trend, weekly/monthly activity, minutes studied, Writing/Speaking by criterion, question-type accuracy |

Daily counters reset at midnight and are derived from data already being written for other reasons (`question_attempts`, `test_history`) rather than a separate counter table — an AI Coach reply now also writes one `test_history` row (`activityType: 'ai_chat'`, migration `0004_ai_chat_activity_type.sql`) so its daily count can be computed the same way. A writing/speaking task that's part of an already-unlocked mock attempt is never blocked by the daily eval limit — the limit only applies to standalone practice, checked via the `mockAttemptId` param those screens already carry.

This is enforced client-side only (consistent with the rest of this Expo/RN app's architecture) — a determined user could bypass it with a modified client. Real production enforcement of paid-tier limits should ultimately live server-side (e.g. checked in the same server-side AI proxy mentioned under "AI provider setup").

## Development commands

```bash
npm run start        # Expo dev server (press i/a/w for iOS/Android/web)
npm run ios          # Start + open iOS Simulator
npm run android      # Start + open Android Emulator
npm run web          # Start + open in a browser
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Jest
npm run test:watch   # Jest watch mode
npm run db:migrate   # Apply supabase/migrations/*.sql (requires DATABASE_URL)
npm run db:seed      # Apply supabase/seed/*.sql + create the demo user (requires DATABASE_URL)
```

### Standalone static preview (no dev server)

`scripts/build-artifact.js` exports the web build and inlines the JS bundle plus every font/icon asset as data URIs into one self-contained `dist-artifact.html` — useful for sharing a click-to-open preview (e.g. as a hosted static file or a Claude Artifact) without running a server:

```bash
npx expo export --platform web
node scripts/build-artifact.js
# open dist-artifact.html directly, or serve it from any static host
```

## Testing

`npm run test` runs the Jest suite in `__tests__/`, covering:

- IELTS band rounding and raw-score → band conversion (`bandScore.test.ts`)
- Answer-checking logic across question types (`answerChecking.test.ts`)
- Text-analysis heuristics used by the mock AI provider (`textAnalysis.test.ts`)
- Mock AI provider output (schema validation + relative scoring) (`aiMockProvider.test.ts`)
- Demo-mode auth/session flow (`auth.test.ts`)
- Mock subscription provider (`purchases.test.ts`)
- Study plan generation logic (`studyPlan.test.ts`)

## Production builds (EAS)

This app uses native modules (`expo-audio`, `expo-notifications`, `react-native-purchases`) that require [EAS Build](https://docs.expo.dev/build/introduction/) — plain Expo Go is fine for development but not for a store release.

```bash
npm install -g eas-cli
eas login
eas build:configure        # links the project to your Expo account, writes extra.eas.projectId
eas build --profile development --platform ios      # or android
eas build --profile production --platform all
eas submit --platform ios      # or android
```

Build profiles are defined in `eas.json` (`development`, `preview`, `production`). Before your first production build:

- Set real `ios.bundleIdentifier` / `android.package` in `app.json` if `com.ieltsprep.app` isn't yours.
- Replace the placeholder icons/splash in `assets/` with your real branding.
- Replace the Privacy Policy / Terms placeholders in `app/help.tsx`.
- Configure the microphone (`NSMicrophoneUsageDescription`, `RECORD_AUDIO`) and notification permission strings in `app.json` if you change their wording.

## Account deletion (Edge Function)

The mobile app's anon/publishable Supabase key cannot delete an `auth.users` row directly (that requires the service-role key, which must never ship in the app). `services/auth.ts`'s `deleteAccount()` calls a Supabase Edge Function named `delete-account` for this. Deploy one like:

```ts
// supabase/functions/delete-account/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  await admin.auth.admin.deleteUser(user.id); // profiles/etc. cascade via FK ON DELETE CASCADE
  return new Response('OK');
});
```

```bash
supabase functions deploy delete-account
```

In Demo Mode, "Delete account" just resets the local on-device database — no function needed.

## Known limitations

- **Demo listening audio** is synthesized on-device via text-to-speech (no bundled audio files) — attach real `audio_url`s to `listening_tracks` for production-quality listening audio.
- **Pronunciation scoring** (both mock and real AI providers) is estimated from transcript/speech patterns, not full acoustic phoneme analysis — labeled as an estimate everywhere it's shown.
- **`react-native-purchases`** requires a custom dev client / real build, not Expo Go.
- Content (lessons, questions, vocabulary, mock tests) grows by editing `lib/content/*.ts` only, then running `npm run seed:generate` to regenerate the matching SQL — see "Content model" above.
