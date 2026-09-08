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

**Content model:** all lessons, questions, passages, listening tracks, writing prompts, speaking topics, vocabulary, and grammar lessons live in `lib/content/*.ts` (mirrored 1:1 by `supabase/seed/*.sql`). When Supabase is configured, `services/repository/*.ts` reads/writes the database instead; when it isn't, the same functions read the bundled content and read/write `lib/demoStore.ts`. Every screen calls through `services/repository`, so switching between Demo Mode and a real backend requires no screen changes.

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

The schema (`supabase/migrations/0001_init.sql`) covers every table in the product spec: profiles, goals, lessons/progress, questions/attempts, passages, listening tracks, mock tests/sections/attempts, reading/listening attempts, writing submissions/feedback, speaking sessions/responses/feedback, band scores (with a configurable raw-score → band conversion table), study plans/items, vocabulary + spaced repetition, grammar lessons, achievements, AI conversations/messages, subscriptions, notifications, bookmarks, and test history — each with RLS so users can only read/write their own rows, and public content tables (lessons, questions, etc.) readable by anyone.

## AI provider setup

`EXPO_PUBLIC_AI_PROVIDER` selects the provider (`services/ai/index.ts`); if the selected provider's key is missing, it silently falls back to mock so the app never breaks.

- **`mock`** (default) — deterministic, heuristic scoring (word count, sentence variety, linking devices, filler words, vocabulary richness) that produces genuinely differentiated, useful feedback with zero setup. See `services/ai/mockProvider.ts`.
- **`openai`** — set `EXPO_PUBLIC_OPENAI_API_KEY` (and optionally `EXPO_PUBLIC_OPENAI_MODEL`, default `gpt-4o-mini`). Also enables real audio transcription (Whisper) for the Speaking Examiner.
- **`anthropic`** — set `EXPO_PUBLIC_ANTHROPIC_API_KEY` (and optionally `EXPO_PUBLIC_ANTHROPIC_MODEL`, default `claude-sonnet-5`). Anthropic has no audio transcription API, so Speaking transcription falls back to OpenAI (if configured) or the mock simulated transcript.

All real-provider outputs are validated against Zod schemas (`services/ai/schemas.ts`) before use; a malformed or failed response falls back to the mock provider's output rather than crashing or showing garbage.

## RevenueCat setup

`services/purchases/` mirrors the AI provider pattern:

- **Unconfigured** (default) — `services/purchases/mockProvider.ts` simulates two products (monthly/yearly) and instant "purchases," clearly labeled as simulated in the paywall UI. No store setup needed to exercise the full paywall flow.
- **Configured** — set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` from the [RevenueCat dashboard](https://app.revenuecat.com) after setting up your App Store Connect / Google Play products and a RevenueCat "current" offering. `services/purchases/revenuecatProvider.ts` then loads real products dynamically (never hardcoded) via `react-native-purchases`. This requires a [custom dev client](https://docs.expo.dev/develop/development-builds/introduction/) or a real build — it will not work in Expo Go.

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
- Content (lessons, questions, vocabulary, mock tests) is a representative starter set, not exhaustive — add more via `lib/content/*.ts` and the matching `supabase/seed/*.sql` files, which are designed to stay in sync.
