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

- **Nothing set** → Demo Mode (default, no backend, everything local).
- **`EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`** → real backend, and — automatically, no separate AI toggle — real AI evaluation/coach turns on too, *if* you've also configured an AI provider key on the **server** side (see "AI provider setup" below). This is deliberate: there is no client-side AI provider variable anymore.
- **`EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY`** → real subscriptions.

Restart the Expo dev server after changing `.env` (`EXPO_PUBLIC_*` vars are inlined at build time).

**Every variable in `.env`/`.env.example` is safe to ship inside the compiled app.** That's what the `EXPO_PUBLIC_` prefix means in Expo — those values are inlined into the JS bundle and can be extracted by anyone with the app binary or the web build's network tab. Nothing that must stay secret (AI provider keys, the Supabase service-role key, RevenueCat's private API key) belongs in this file — see "AI provider setup" for where those actually go.

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

The schema (`supabase/migrations/0001_init.sql`, plus `0002_content_expansion_schema.sql` for mock test numbering/difficulty and writing chart data, `0003_grammar_practice.sql` for grammar practice questions/attempts, `0004_ai_chat_activity_type.sql` for the AI Coach's daily-limit activity type, and `0005_ai_usage_log.sql` for server-side AI rate-limiting/audit logging) covers every table in the product spec: profiles, goals, lessons/progress, questions/attempts, passages, listening tracks, mock tests/sections/attempts, reading/listening attempts, writing submissions/feedback, speaking sessions/responses/feedback, band scores (with a configurable raw-score → band conversion table), study plans/items, vocabulary + spaced repetition, grammar lessons/questions/attempts, achievements, AI conversations/messages, subscriptions, notifications, bookmarks, test history, and the AI usage audit log — 39 tables total, each with RLS so users can only read/write their own rows, and public content tables (lessons, questions, etc.) readable by anyone.

**Verification status:** every table listed above has RLS enabled and at least one policy (verified with a static script comparing `create table` / `enable row level security` / `create policy` statements — 39/39 tables covered, zero gaps; the RLS policies were additionally re-reviewed by hand as part of the server-side AI migration, including the 5 join-based child-table policies (`writing_feedback`, `speaking_responses`, `speaking_feedback`, `study_plan_items`, `ai_messages`) that scope through a parent owner row rather than a direct `user_id` column), every foreign key uses `on delete cascade` (or `set null` where a null reference is meaningful, e.g. a question whose passage was removed), `subscriptions.user_id` and other 1:1 tables carry a `unique` constraint so upserts behave correctly, and every `.from('table_name')` call and column name in `services/repository/*.ts` was cross-checked against the actual migration column names — no drift found. **This is static verification only.** The schema and repository layer have **not** been exercised against a real, running Supabase project in this environment (no `DATABASE_URL`/Supabase credentials are available here) — running `npm run db:migrate && npm run db:seed` against a real project and smoke-testing sign-up → onboarding → a mock attempt → a writing submission is still needed before relying on the Supabase path in production.

## AI provider setup

**AI provider keys are server-only.** There is no `EXPO_PUBLIC_OPENAI_API_KEY` or `EXPO_PUBLIC_ANTHROPIC_API_KEY` — those would ship the key inside the app binary, which is never safe for a real paid key. Instead:

- **`services/ai/mockProvider.ts`** — deterministic, heuristic scoring (word count, sentence variety, linking devices, filler words, vocabulary richness) that produces genuinely differentiated, useful feedback with zero setup. This is what runs in Demo Mode, and it's also the client's automatic fallback whenever the real path below is unavailable for any reason.
- **`supabase/functions/`** — five Supabase Edge Functions (`evaluate-writing`, `evaluate-speaking`, `ai-coach`, `transcribe-audio`, `study-plan-suggestion`) are the *only* code anywhere in this project that holds a real OpenAI/Anthropic key or calls their APIs. The mobile app calls these functions instead, authenticated with the signed-in user's own Supabase session (supabase-js attaches that automatically) — see `services/ai/edgeFunctionProvider.ts`, the only client-side AI provider left, which holds no secret at all.

The client's provider selection (`services/ai/index.ts`) is now just: Demo Mode (no Supabase configured) → always mock, zero network calls; Supabase configured → attempt the Edge Function, fall back to mock on any failure (network error, no server-side AI key configured, rate limit, invalid output). **This is what makes real AI turn on automatically once both Supabase and an AI key are configured, with no separate client-side switch to flip.**

### Deploying the Edge Functions

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli) and a project linked to this repo:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>   # Project Settings → General → Reference ID

# Apply the ai_usage_log migration (or run npm run db:migrate, which covers all migrations)
npx supabase db push

# Set the real secret(s) — see supabase/functions/.env.example for the full list.
# Never add EXPO_PUBLIC_ to any of these; they are read only inside the
# Edge Function runtime, never bundled into the app.
npx supabase secrets set OPENAI_API_KEY=sk-...
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   # optional, if you also/instead want Anthropic
npx supabase secrets set AI_PROVIDER=openai              # which to prefer if both are set

# Deploy every function (SUPABASE_URL / SUPABASE_ANON_KEY are injected
# automatically by the platform — do not set those yourself)
npx supabase functions deploy evaluate-writing
npx supabase functions deploy evaluate-speaking
npx supabase functions deploy ai-coach
npx supabase functions deploy transcribe-audio
npx supabase functions deploy study-plan-suggestion
```

With neither `OPENAI_API_KEY` nor `ANTHROPIC_API_KEY` set, every function responds with a clean `ai_not_configured` error and the app quietly falls back to mock — deploying the functions with no key yet is safe and won't break anything.

### What each function does

Every function (`supabase/functions/<name>/index.ts`, sharing helpers from `supabase/functions/_shared/`) follows the same contract:

1. **Auth** — rejects any request without a valid Supabase session JWT (`_shared/supabaseClient.ts`); there is no anonymous access to any AI operation.
2. **Validation** — the request body is parsed against a Zod schema (`_shared/schemas.ts`); malformed input is rejected with a 400 before it ever reaches the AI provider.
3. **Rate limiting** — `_shared/rateLimit.ts` enforces real, server-side daily caps per user per operation (checked against the `ai_usage_log` table, not trusted from the client), with a higher ceiling for Premium accounts (read from the user's own `subscriptions` row). This is the actual security boundary — the same-looking limits in `lib/entitlements.ts` are client-side UX only (hiding a button before a wasted request) and were never meant to be the enforcement layer.
4. **The real call** — `_shared/aiProviders.ts` calls OpenAI or Anthropic with a 30s timeout (60s for transcription) and retries on 429/5xx (`_shared/httpClient.ts`, the server-side twin of the client's old retry logic).
5. **Output validation** — the model's JSON response is parsed against the same Zod schemas used client-side (`WritingEvaluationSchema`/`SpeakingEvaluationSchema`); a malformed response is rejected (502) rather than passed through.
6. **Usage logging** — every attempt (success or failure) is written to `ai_usage_log` (`user_id`, `operation`, `provider`, `success`, `created_at`) — both the audit trail and what step 3 counts against next time. RLS on that table means a user can only ever read their own usage rows.
7. **Structured errors** — every non-2xx response is `{ error: { code, message } }` with a stable `code` (`unauthorized`, `invalid_request`, `rate_limited`, `ai_not_configured`, `invalid_ai_output`, `upstream_error`) so the client can react to failure classes, not parse free text.

`study-plan-suggestion` is built and deployable like the rest, but the mobile app does not currently call it — the study plan screen's existing heuristic logic (`services/repository/studyPlan.ts`) was left as-is per this migration's "don't rebuild existing features" scope. It's there, fully wired end-to-end, for a future "AI note on your study plan" feature to call without another security migration.

All real-provider outputs are validated against Zod schemas before use both server- and client-side; a malformed or failed response falls back to the mock provider's output rather than crashing or showing garbage. Every screen that shows an AI-generated score (Writing feedback, Speaking feedback, AI Coach) displays a small "Demo AI" / "Live AI" badge reflecting **that specific result's** actual source (`services/ai/index.ts`'s `aiSource` field) — not just whether a provider is configured, since a single call can still fall back to mock output on a network error even with everything configured.

**Verification status:** the Edge Functions type-check under `deno check` conventions and were reviewed line-by-line against the auth/validation/rate-limit/logging contract above, and the client-side boundary (`EdgeFunctionProvider`, provider selection, error classification) has Jest coverage (`__tests__/edgeFunctionProvider.test.ts`, `__tests__/aiProviderSelection.test.ts`). **They have not been deployed or exercised against a real Supabase project or a real OpenAI/Anthropic key in this environment** — no Supabase CLI login or API keys are available here. Deploy them and run one real Writing evaluation, one Speaking evaluation, one AI Coach message, and one transcription before relying on this path in production.

## Listening audio generation

Every listening track plays out of the box via real, audible on-device text-to-speech (`expo-speech`) — no listening button is ever a no-op. For higher-quality, pre-rendered audio instead:

```bash
echo "OPENAI_API_KEY=sk-..." >> .env   # dev-machine-only secret, read by this script alone — never EXPO_PUBLIC_
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
- **The Supabase Edge Functions (`supabase/functions/`) are implemented and reviewed but not yet deployed or run against a real AI key** — see "Verification status" at the end of "AI provider setup" above.
