# IELTS Prep

A complete, production-structured IELTS preparation app for iOS, Android, and web — built with Expo, React Native, and TypeScript.

It covers all four IELTS skills (Listening, Reading, Writing, Speaking), realistic exam-style test interfaces, a full mock test flow with an AI-generated band report, an AI Speaking Examiner and Writing Evaluator, an AI Coach chat, vocabulary and grammar training, progress analytics, gamification, push notifications, and a subscription/paywall system — and it runs **fully offline in Demo Mode with zero configuration**.

> All AI-generated band scores in this app are **practice estimates**, not official IELTS results.

## Table of contents

- [What's included](#whats-included)
- [Tech stack](#tech-stack)
- [Quick start (Demo Mode)](#quick-start-demo-mode)
- [Production setup checklist](#production-setup-checklist)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [AI provider setup](#ai-provider-setup)
- [RevenueCat setup](#revenuecat-setup)
- [Free vs. Premium boundary](#free-vs-premium-boundary)
- [Development commands](#development-commands)
- [Testing](#testing)
- [Developer health check screen](#developer-health-check-screen)
- [Edge Function integration tests](#edge-function-integration-tests)
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
| AI | Pluggable provider abstraction — mock (default), OpenAI, Anthropic, or Gemini |
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

## Production setup checklist

Everything above runs with zero configuration. This is the ordered checklist for connecting a real Supabase project and a real AI provider — each step links to the section with the full detail; this is just the sequence and the exact command for each.

- [ ] **Create a Supabase project** — [supabase.com](https://supabase.com) → New project. Grab its URL, anon key, and Reference ID (Project Settings → API / General).
- [ ] **Link the Supabase CLI** to that project:
  ```bash
  npx supabase login
  npx supabase link --project-ref <your-project-ref>
  ```
- [ ] **Push the migrations** (creates all 39 tables, RLS policies, and the `ai_usage_log` table the Edge Functions rate-limit against):
  ```bash
  npx supabase db push
  # or: npm run db:migrate   (requires DATABASE_URL in .env — see "Supabase setup")
  ```
  All 5 migration files were verified to apply cleanly, in order, to a fresh database as part of this checklist's own preparation — see "Supabase setup" → Verification status.
- [ ] **Set the client's Supabase URL/anon key** in `.env` (`cp .env.example .env` first if you haven't):
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
  ```
  Restart `npm run start` after saving — these are the *only* two things that switch the app out of Demo Mode.
- [ ] **Set an AI provider key as a Supabase secret** (server-side only — never in `.env`):
  ```bash
  npx supabase secrets set OPENAI_API_KEY=sk-...
  # and/or: npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
  # and/or: npx supabase secrets set GEMINI_API_KEY=AIza...   # free-tier Gemini Developer API key
  npx supabase secrets set AI_PROVIDER=openai   # openai | anthropic | gemini
  ```
- [ ] **Deploy the Edge Functions**:
  ```bash
  npx supabase functions deploy evaluate-writing
  npx supabase functions deploy evaluate-speaking
  npx supabase functions deploy ai-coach
  npx supabase functions deploy transcribe-audio
  npx supabase functions deploy study-plan-suggestion
  ```
- [ ] **Verify auth** — sign up a real account in the app (not "Continue with Demo Mode"); confirm a row appears in Supabase's `auth.users` and a matching row in `public.profiles` (the `handle_new_user` trigger creates it automatically).
- [ ] **Verify RLS** — in the Supabase SQL editor, run `select * from question_attempts;` as the `service_role` (should see all rows) vs. querying through the app as two different signed-up users (each should only ever see their own data — practice attempts, mock results, writing/speaking submissions, AI Coach conversations, study plan, subscription). See "Supabase setup" → Verification status for what was already checked statically and live against a local database; this step is the one live check that still needs a real project.
- [ ] **Test Writing evaluation** — Practice → Browse writing prompts → submit a short essay. The feedback screen's badge should read "Live AI (openai)", "(anthropic)", or "(gemini)", not "Demo AI".
- [ ] **Test Speaking evaluation** — Practice → Speaking practice → complete a Part 1/2/3 turn. Same badge check, plus confirm the transcript is real (not the mock's simulated placeholder text).
- [ ] **Test AI Coach** — tap the floating AI Coach button on Home, send a message, confirm a real (non-canned) reply and the "Live AI" badge.
- [ ] **(Optional, dev builds only)** Run the in-app health check screen (`/dev-health-check`, dev-mode-only — see "Developer health check screen") to verify all of the above — Supabase reachability, auth, DB read/write, each Edge Function, AI provider configuration, RevenueCat configuration, and listening audio assets — from one screen instead of manual testing.
- [ ] **(Optional)** Run `scripts/verify-edge-functions.ts` (see "Edge Function integration tests") against the deployed functions with a real test-user session for an automated pass/fail check of the whole AI boundary.

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

**Verification status:** every table listed above has RLS enabled and at least one policy — this was confirmed two ways: a static script comparing `create table` / `enable row level security` / `create policy` statements across every migration (39/39 tables covered, zero gaps), and, separately, by actually applying all 5 migration files, in order, to a real fresh local Postgres 16 database (with a minimal hand-written stand-in for Supabase's own `auth.users` table + `auth.uid()` function, since those are normally provisioned by the Supabase platform itself, not by these migrations) and querying `pg_policies`/`pg_tables` afterward — same result, live: 39/39 tables with RLS, 39/39 with at least one policy, including the 5 join-based child-table policies (`writing_feedback`, `speaking_responses`, `speaking_feedback`, `study_plan_items`, `ai_messages`) that scope through a parent owner row rather than a direct `user_id` column. The migrations were also re-applied a second time against that same database to confirm they're idempotent (safe to re-run), and all seed files were applied on top and produced row counts matching the content library exactly (101 reading passages, 122 listening tracks, 2,535 questions, 323 writing prompts, 618 speaking topic rows, 902 vocabulary words, 99 grammar lessons, 572 grammar questions, 66 skill lessons, 32 mock tests, 128 mock sections) — that pass caught the seed-generator escaping bug documented above **and, on re-verification after the Astra content merge, a real bug in the merge's own id-generation helper**: several new content tables (`reading_passages`, `listening_tracks`, `speaking_topics`, `lessons`, `writing_prompts`, `mock_tests`) require their `id` column to be a valid Postgres `uuid`, and the merge script's uuid-builder produced a 9-character first segment for every 2-digit id prefix instead of the required 8 — invisible until the generated seed SQL was actually run against Postgres (generating the SQL text alone doesn't validate it). Fixed and re-verified live against a fresh database with zero errors, 0 tables missing RLS, and 0 orphaned foreign keys across passage/track references. Every foreign key uses `on delete cascade` (or `set null` where a null reference is meaningful, e.g. a question whose passage was removed), `subscriptions.user_id` and other 1:1 tables carry a `unique` constraint so upserts behave correctly, and every `.from('table_name')` call and column name in `services/repository/*.ts` was cross-checked against the actual migration column names — no drift found. **What this does *not* cover:** a real Supabase-hosted project's own GoTrue auth behavior, network latency/API surface, or platform-specific settings — only a locally-run vanilla Postgres with a minimal auth stand-in was used, since no real Supabase project or credentials are available in this environment. Running `npm run db:migrate && npm run db:seed` against a real Supabase project and smoke-testing sign-up → onboarding → a mock attempt → a writing submission is still needed before relying on the Supabase path in production — see "Production setup checklist" above.

## AI provider setup

**AI provider keys are server-only.** There is no `EXPO_PUBLIC_OPENAI_API_KEY`, `EXPO_PUBLIC_ANTHROPIC_API_KEY`, or `EXPO_PUBLIC_GEMINI_API_KEY` — those would ship the key inside the app binary, which is never safe for a real paid key. Instead:

- **`services/ai/mockProvider.ts`** — deterministic, heuristic scoring (word count, sentence variety, linking devices, filler words, vocabulary richness) that produces genuinely differentiated, useful feedback with zero setup. This is what runs in Demo Mode, and it's also the client's automatic fallback whenever the real path below is unavailable for any reason.
- **`supabase/functions/`** — five Supabase Edge Functions (`evaluate-writing`, `evaluate-speaking`, `ai-coach`, `transcribe-audio`, `study-plan-suggestion`) are the *only* code anywhere in this project that holds a real OpenAI/Anthropic/Gemini key or calls their APIs. The mobile app calls these functions instead, authenticated with the signed-in user's own Supabase session (supabase-js attaches that automatically) — see `services/ai/edgeFunctionProvider.ts`, the only client-side AI provider left, which holds no secret at all.

Three providers are supported for text generation (Writing/Speaking evaluation, AI Coach, study-plan suggestion) — **OpenAI**, **Anthropic**, and **Google Gemini** (via the free-tier-eligible Gemini Developer API, `gemini-2.0-flash` by default, structured JSON output via `responseMimeType: 'application/json'`) — selected by `AI_PROVIDER` and whichever key(s) are actually set (`_shared/aiProviders.ts`). Gemini's raw response is Zod-validated against the exact same schemas (`WritingEvaluationSchema`, `SpeakingEvaluationSchema`, `StudyPlanSuggestionSchema`) as OpenAI/Anthropic, with the same "malformed output → 502, never trust it" behavior.

**Audio transcription** supports both OpenAI (Whisper, `whisper-1`) and Gemini (the same general-purpose multimodal model as above, called via `generateContent` with the audio sent inline as base64 alongside a verbatim-transcription instruction — Gemini has no separate speech-to-text endpoint on the free tier; the dedicated `gemini-3.5-transcribe` model exists but requires the Interactions API and is not free, so it isn't used here). OpenAI is still preferred by default when both keys are set, for backwards compatibility; set `AI_PROVIDER=gemini` to use Gemini for transcription too. Anthropic has no audio API at all — with only `ANTHROPIC_API_KEY` set, transcription falls back to the client's simulated transcript, same as no key configured. Override `GEMINI_TRANSCRIBE_MODEL` independently of `GEMINI_MODEL` if you want transcription on a different model.

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
npx supabase secrets set GEMINI_API_KEY=AIza...          # optional — free-tier Gemini Developer API key from https://aistudio.google.com/apikey
npx supabase secrets set AI_PROVIDER=openai              # which to prefer if more than one key is set: openai | anthropic | gemini

# Deploy every function (SUPABASE_URL / SUPABASE_ANON_KEY are injected
# automatically by the platform — do not set those yourself)
npx supabase functions deploy evaluate-writing
npx supabase functions deploy evaluate-speaking
npx supabase functions deploy ai-coach
npx supabase functions deploy transcribe-audio
npx supabase functions deploy study-plan-suggestion
```

With none of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY` set, every function responds with a clean `ai_not_configured` error and the app quietly falls back to mock — deploying the functions with no key yet is safe and won't break anything.

### What each function does

Every function (`supabase/functions/<name>/index.ts`, sharing helpers from `supabase/functions/_shared/`) follows the same contract:

1. **Auth** — rejects any request without a valid Supabase session JWT (`_shared/supabaseClient.ts`); there is no anonymous access to any AI operation.
2. **Validation** — the request body is parsed against a Zod schema (`_shared/schemas.ts`); malformed input is rejected with a 400 before it ever reaches the AI provider.
3. **Rate limiting** — `_shared/rateLimit.ts` enforces real, server-side daily caps per user per operation (checked against the `ai_usage_log` table, not trusted from the client), with a higher ceiling for Premium accounts (read from the user's own `subscriptions` row). This is the actual security boundary — the same-looking limits in `lib/entitlements.ts` are client-side UX only (hiding a button before a wasted request) and were never meant to be the enforcement layer.
4. **The real call** — `_shared/aiProviders.ts` calls OpenAI, Anthropic, or Gemini (whichever is configured) with a 30s timeout (60s for transcription) and retries on 429/5xx (`_shared/httpClient.ts`, the server-side twin of the client's old retry logic). A blocked Gemini response (safety filters, `finishReason: SAFETY`) is surfaced as a distinct error rather than a generic failure.
5. **Output validation** — the model's JSON response is parsed against the same Zod schemas used client-side (`WritingEvaluationSchema`/`SpeakingEvaluationSchema`); a malformed response is rejected (502) rather than passed through.
6. **Usage logging** — every attempt (success or failure) is written to `ai_usage_log` (`user_id`, `operation`, `provider`, `success`, `created_at`) — both the audit trail and what step 3 counts against next time. RLS on that table means a user can only ever read their own usage rows.
7. **Structured errors** — every non-2xx response is `{ error: { code, message } }` with a stable `code` (`unauthorized`, `invalid_request`, `rate_limited`, `ai_not_configured`, `invalid_ai_output`, `upstream_error`) so the client can react to failure classes, not parse free text.

`study-plan-suggestion` is built and deployable like the rest, but the mobile app does not currently call it — the study plan screen's existing heuristic logic (`services/repository/studyPlan.ts`) was left as-is per this migration's "don't rebuild existing features" scope. It's there, fully wired end-to-end, for a future "AI note on your study plan" feature to call without another security migration.

All real-provider outputs are validated against Zod schemas before use both server- and client-side; a malformed or failed response falls back to the mock provider's output rather than crashing or showing garbage. Every screen that shows an AI-generated score (Writing feedback, Speaking feedback, AI Coach) displays a small "Demo AI" / "Live AI" badge reflecting **that specific result's** actual source (`services/ai/index.ts`'s `aiSource` field) — not just whether a provider is configured, since a single call can still fall back to mock output on a network error even with everything configured.

**Verification status:** all 5 Edge Functions, including the Gemini branch, were type-checked and linted with a real Deno 2.9.6 binary (`deno check` + `deno lint`, both clean) and reviewed line-by-line against the auth/validation/rate-limit/logging contract above. The migrations they depend on (`ai_usage_log`, `subscriptions`) were verified by actually applying all migrations to a fresh local Postgres database — that pass also caught and fixed a real SQL-escaping bug in the seed generator. The client-side boundary (`EdgeFunctionProvider`, provider selection, error classification, the study-plan-suggestion fallback) has Jest coverage (`__tests__/edgeFunctionProvider.test.ts`, `__tests__/aiProviderSelection.test.ts`, `__tests__/aiMockProvider.test.ts`). Gemini's provider-selection logic (text and transcription), request/response shape, inline-audio transcription request shape, safety-block error handling, and Zod response validation have their own Deno test suite (`supabase/functions/_shared/aiProviders.test.ts`, `fetch` mocked — run with `deno test --allow-env --allow-read --node-modules-dir=none _shared/aiProviders.test.ts` from `supabase/functions/`), all 16 cases passing. **None of the three providers, Gemini included, have been deployed or exercised against a real Supabase project or a real API key in this environment** — no Supabase CLI login or API keys are available here, so Gemini support is statically verified only (typecheck, lint, mocked-fetch tests), not live-tested end-to-end. Deploy them and run one real Writing evaluation, one Speaking evaluation, one AI Coach message, and one transcription — and, if using Gemini, confirm `GEMINI_MODEL` is still on the free Developer API tier at https://ai.google.dev/pricing before relying on it in production — the dev health check screen and `scripts/verify-edge-functions.ts` below make that fast to do.

## Listening audio generation

Every listening track plays out of the box via real, audible on-device text-to-speech (`expo-speech`) — no listening button is ever a no-op. For a track with no pre-generated audio, this is still what plays in production, which is why it's a real fallback and not a decorative button — but it is single-voice and, on any track that hasn't been migrated to `turns` (below), it literally reads speaker labels ("Receptionist:", "Tutor:") out loud. Pre-generated audio fixes both problems and is what a genuinely production-ready section should use.

**Two things a listening track needs to sound right:**

1. **Structured `turns` on the track** (`ListeningTrack.turns` in `types/models.ts`) — an array of `{ speaker, text }` splitting the transcript by who's speaking, with `text` holding only the actual spoken words (never a "Speaker:" prefix). A handful of tracks have been migrated as a proof of concept (the free Academic Mock 1 listening section — see `lib/content/listening.ts` and `lib/content/listening2.ts`); the rest still only have the legacy single-string `transcript` and fall back to on-device TTS with no per-speaker voice.
2. **Pre-generated audio**, produced from those `turns`:
   ```bash
   brew install ffmpeg   # one-time — used to add natural pauses between speaker turns
   echo "OPENAI_API_KEY=sk-..." >> .env   # dev-machine-only secret, read by this script alone — never EXPO_PUBLIC_
   npm run audio:generate
   ```
   `scripts/generate-audio.ts` only processes tracks that have `turns` — it never touches a track that's still transcript-only, so this is safe to run repeatedly as more tracks get migrated. For each migrated track it synthesizes **one OpenAI TTS call per turn** (`OPENAI_TTS_MODEL`, default `tts-1`), assigning each unique speaker in that track a distinct voice (`lib/content/audioVoiceAssignment.ts` — deterministic, so re-running the script never reshuffles voices) at a **speed and inter-turn silence gap set per IELTS section** (`lib/content/listeningPace.ts` — Section 1 is slightly slower with longer pauses, Section 4 is denser and more continuous, matching real IELTS difficulty progression), then concatenates the per-turn clips via `ffmpeg`. Without `ffmpeg` installed it still concatenates the clips (no gap, and a warning is printed). The MP3s are saved under `assets/audio/<trackId>.mp3`, and `lib/content/audioRegistry.ts` is rebuilt from whatever `.mp3` files actually exist on disk (so it never drops a previously-generated track, including the 74 Astra-sourced ones already committed). `TranscriptAudioPlayer` checks that registry first and only falls back to text-to-speech for tracks it doesn't cover. Re-running the script skips any track that already has a file — delete it first to force a re-generation (e.g. after editing that track's `turns`).

To migrate another track: add a `turns` array to it (see the 4 tracks in `lib/content/listening.ts`/`listening2.ts` for the pattern — one entry per line of dialogue, or one per paragraph for a monologue) and an `audioSource: { kind: 'generated_tts', provider: 'openai-tts-1' }`, then run `npm run audio:generate`. Also add its id to the `PENDING_AUDIO_GENERATION` allowlist in `__tests__/contentIntegrity.test.ts` until you've actually run the script and committed its `.mp3` — the "production audio coverage" test in that file fails on purpose for any turns-based track that's neither generated nor on that list, so it can never silently regress to the on-device fallback.

**Single shared pipeline, app-wide.** Every Listening entry point — full mock tests (free and premium, Academic and General), the standalone Listening section test, and skill practice — renders audio through exactly one component, `components/testing/TranscriptAudioPlayer.tsx`, from exactly two screens (`app/listening-test.tsx` and `app/practice-session.tsx`). `__tests__/contentIntegrity.test.ts`'s "exactly one playback pipeline app-wide" tests enforce this structurally (scanning `app/` and `components/` for any other `expo-speech`/`Speech.speak(` or direct `audioRegistry` usage) — they fail if a future screen ever bypasses it.

**Real human speech vs. generated audio.** Every listening track's `audioSource.kind` is either `'generated_tts'` (OpenAI TTS, as above) or `'human_corpus'` (a reused real recording, with a required `license`/`sourceUrl`/`attribution` validated by `lib/content/audioLicense.ts`). Phase 1 researched Mozilla Common Voice (CC0, but isolated single-sentence ASR-training clips — no natural dialogue), OpenSLR/VCTK/LibriSpeech (CC BY 4.0, same isolated-sentence problem, and LibriSpeech is itself sourced from LibriVox), TED talks (CC BY-NC-ND — rejected outright, no commercial/derivative use), and LibriVox (Public Domain, explicitly commercial-use-safe, and includes both single-narrator non-fiction readings *and* multi-reader "dramatic reading" recordings). LibriVox's academic/non-fiction catalog is a genuinely strong match for Section 4's register (dense single-speaker informational monologue) and is the recommended Phase 2 starting point for real human audio — see the Listening overhaul report for why it wasn't used for the Phase 1 proof-of-concept mock (transcript-verification tooling, not licensing, was the blocker) and the concrete methodology for doing it safely (transcribe a candidate clip with the app's own `transcribe-audio` Edge Function, have a human verify the draft against the actual audio, only then author questions from the verified transcript).

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

`npm run test` runs the Jest suite in `__tests__/` (13 suites, 113 tests), covering:

- IELTS band rounding and raw-score → band conversion (`bandScore.test.ts`)
- Answer-checking logic across question types (`answerChecking.test.ts`)
- Text-analysis heuristics used by the mock AI provider (`textAnalysis.test.ts`)
- Mock AI provider output, including Writing/Speaking/Coach and the study-plan focus-note heuristic (schema validation + relative scoring) (`aiMockProvider.test.ts`)
- Demo-mode auth/session flow (`auth.test.ts`)
- Mock subscription provider (`purchases.test.ts`)
- Study plan generation logic (`studyPlan.test.ts`)
- Study plan item → screen navigation mapping (`studyPlanNav.test.ts`)
- Free-tier daily-limit entitlement logic (`entitlements.test.ts`)
- Content library integrity — no duplicate IDs, every question maps to a real passage/track, mock tests don't reuse content, minimum content counts (`contentIntegrity.test.ts`)
- Client-side AI provider selection (Demo Mode vs. Supabase-configured) (`aiProviderSelection.test.ts`)
- The Edge Function client boundary — request shape, provider-name reporting, schema-validation rejection, 429/401 error classification (`edgeFunctionProvider.test.ts`)
- The seed-SQL generator's string-escaping (a real bug this caught — see "Supabase setup" → Verification status) (`generateSeedSql.test.ts`)

## Developer health check screen

`app/dev-health-check.tsx`, linked from Profile → "Developer health check" — **only rendered when `__DEV__` is true**, both the screen itself and its Profile entry point, so it never ships in a production build. Runs a battery of live checks in one tap:

- Supabase configured / reachable (a real query against a public table)
- Auth working (`supabase.auth.getUser()` — a server-verified session, not just a cached local token)
- Database read/write (round-trips a write + read against your own `profiles` row — no throwaway data left behind)
- Every AI Edge Function reachable — pings each with `{ healthCheck: true }`, which every function answers immediately after verifying your session, before touching rate limits or the real AI provider, so running this costs nothing and never consumes your daily AI quota
- AI provider configured (from the same ping — reports which of OpenAI/Anthropic/Gemini is active server-side, or that none is set)
- Transcription provider configured (OpenAI or Gemini, checked separately — Anthropic has no audio API and is never used for transcription)
- RevenueCat configured
- Listening audio assets (X/Y tracks pre-generated vs. relying on the on-device TTS fallback — never reported as a failure, since the fallback always works)

Use it after deploying Edge Functions or connecting a new Supabase project to confirm everything is wired correctly without manually testing every screen.

## Edge Function integration tests

`scripts/verify-edge-functions.ts` is a standalone Node script (not part of `npm test`, since it needs real deployed infrastructure and a real account) that exercises every deployed Edge Function end-to-end once you have real credentials:

```bash
# .env needs: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY,
# EDGE_FN_TEST_EMAIL, EDGE_FN_TEST_PASSWORD (a real, already-signed-up test account)
npx tsx scripts/verify-edge-functions.ts
```

It signs in as that test account, then for each function: sends a `{ healthCheck: true }` ping (reachability + provider-configured), and — only if `--full` is passed — a real minimal request that exercises an actual AI call end-to-end (costs real API usage and counts against that account's daily rate limit). Prints a pass/fail summary per function with the actual response, so a broken deploy or a missing secret shows up immediately instead of surfacing as a confusing failure inside the app. See the script's own header comment for the full flag list.

## Production builds (EAS)

This app uses native modules (`expo-audio`, `expo-notifications`, `react-native-purchases`) that require [EAS Build](https://docs.expo.dev/build/introduction/) — plain Expo Go is fine for development but not for a store release. As of Expo SDK 53+, Expo Go on Android also no longer includes `expo-notifications`' native module at all (`expo-notifications: ... was removed from Expo Go`) — a development build is required to use local scheduled notifications on Android, not just for a store release.

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

### Building and installing a development build on an Android phone

`expo-dev-client` is a dependency and `eas.json`'s `development` profile already has `developmentClient: true` + `android.buildType: "apk"` (a direct-installable APK, not an `.aab` store bundle) — no extra config plugin entry is needed for `expo-dev-client` itself, it autolinks.

```bash
npm install -g eas-cli          # if not already installed
eas login                        # your Expo account
eas build:configure              # only needed once — links this project to EAS, writes extra.eas.projectId to app.json
eas build --profile development --platform android
```

That last command builds in Expo's cloud (no local Android SDK needed on your Mac) and, when it finishes, prints a URL/QR code for the built `.apk`. To get it onto your phone:

- **Easiest:** open the printed build URL (or scan the QR code) on the Android phone itself, tap to download, then tap the downloaded `.apk` to install — Android will prompt you to allow installs from that source once.
- **Or, with the phone connected via USB with USB debugging enabled** (Settings → About phone → tap Build number 7 times → Developer options → USB debugging), run:
  ```bash
  eas build:run --platform android
  ```
  This downloads the finished build and installs it on the connected device (or a running emulator) automatically via `adb`.

Once installed, start the dev server with the dev-client flag (not plain `expo start`, which targets Expo Go):

```bash
npx expo start --dev-client
```

Open the installed app on your phone — it behaves like Expo Go but with full native-module support (notifications included), and reloads on every save just the same.

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
- **`expo-notifications` on Android requires a development build, not Expo Go** (Expo Go for Android dropped its native module starting with SDK 53) — see "Building and installing a development build on an Android phone" above. iOS Expo Go and web are unaffected.
- Content (lessons, questions, vocabulary, mock tests) grows by editing `lib/content/*.ts` only, then running `npm run seed:generate` to regenerate the matching SQL — see "Content model" above.
- **The Supabase Edge Functions (`supabase/functions/`) are implemented and reviewed but not yet deployed or run against a real AI key** — see "Verification status" at the end of "AI provider setup" above.
