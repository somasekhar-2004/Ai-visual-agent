# Google Play Data Safety — developer checklist

**Last updated:** 2026-09-18

This maps IELTS Prep's actual, audited behavior onto Google Play Console's Data Safety form categories. It is a developer worksheet for filling out that form — it is not itself the published disclosure, and answering the real form is still something you must do manually in Play Console (App content → Data safety).

Where the true answer depends on which optional backend features you turn on for your specific deployment (Supabase configured or not, which AI provider key is set, whether RevenueCat is configured), that's called out explicitly — **confirm before submission** rather than guessing.

## How to read this table

- **Collected** — the app gathers this data from the user.
- **Shared** — sent to a third party outside your own Supabase project (an AI provider, RevenueCat, the Play Store itself).
- **Processed ephemerally** — used for one request/operation and not stored afterward by our own infrastructure (may still be retained by a third party per their own policy — see notes).
- **Required vs optional** — whether the app functions at all without this data (Demo Mode, which requires nothing, is always available regardless).

## Personal info

| Field | Collected | Shared | Required? | Purpose | Notes |
|---|---|---|---|---|---|
| Email address | Yes (Signed-in Mode only) | With Supabase (backend), and implicitly with your AI provider only if it appears in AI-facing text (it does not — email is never sent to an AI provider) | Optional — Demo Mode needs none | Account creation, sign-in, support contact | Not collected at all in Demo Mode |
| Name | Yes (display name, user-entered) | With Supabase | Optional (has a default/blank) | Personalizing greetings, AI Coach context | User-typed, not pulled from any device contact/account list |
| Other personal info (target band, exam date, weakest skill, study-time preference) | Yes | With Supabase; sent to the AI provider as part of AI Coach/study-plan context | Optional (features degrade gracefully — see "never fabricate missing values" behavior) | Study plan, progress dashboard, AI Coach grounding | — |

## Account identifiers

| Field | Collected | Shared | Required? | Purpose | Notes |
|---|---|---|---|---|---|
| User ID (Supabase `auth.users` UUID) | Yes | Used as the RevenueCat "app user id" when RevenueCat is configured (identifies the subscriber, not personally identifying by itself) | Required for Signed-in Mode | Auth, entitlement, all row-level data scoping | Never the user's email — a stable random UUID (see `services/purchases/revenuecatProvider.ts`'s `login()`) |

## App activity

| Field | Collected | Shared | Required? | Purpose | Notes |
|---|---|---|---|---|---|
| In-app actions (practice/mock attempts, question answers, scores) | Yes | Not shared outside Supabase; raw essay/transcript text is shared with the configured AI provider only for the specific evaluation request that produced it | Optional (Demo Mode works without an account) | Progress tracking, scoring, AI feedback | — |
| App interactions (which screens/features used) | Not collected as a distinct analytics stream | — | — | — | No analytics SDK is present; only the functional data above (what you actually practiced) is stored, not click/navigation telemetry |
| Crash logs / diagnostics | Not collected via any third-party SDK | — | — | — | No Sentry/Crashlytics/Bugsnag or similar dependency exists in this app. Server-side `console.error`/`console.warn` lines go to Supabase's own function logs, which we (the operator) can view — not a third party, and not shared with users |

## User content

| Field | Collected | Shared | Required? | Purpose | Notes |
|---|---|---|---|---|---|
| Written essays (Writing practice/mock) | Yes | Sent to the configured AI provider for evaluation | Required only for that specific feature | AI Writing evaluation | — |
| Speaking transcripts | Yes (derived from your recording — see Audio below) | Sent to the configured AI provider for evaluation | Required only for that specific feature | AI Speaking evaluation | — |
| AI Coach messages | Yes | Sent to the configured AI provider to generate a reply | Required only for that specific feature | Coaching conversation | — |

## Audio / voice recordings

| Field | Collected | Shared | Required? | Purpose | Notes |
|---|---|---|---|---|---|
| Microphone audio (Speaking practice/mock) | Yes, only while actively recording a response the user started | Uploaded to our server-side Edge Function, which forwards it to the configured AI provider for transcription | Required only for Speaking features | Generating a transcript for Speaking evaluation | Not written to a persistent server-side storage bucket by our own infrastructure (confirmed: no Supabase Storage `.upload()` call exists in the transcription/evaluation code path). We do not claim the third-party AI provider discards it immediately — see that provider's own policy. We do not claim the local on-device recording file is deleted immediately after upload |

## Financial / purchase info

| Field | Collected | Shared | Required? | Purpose | Notes |
|---|---|---|---|---|---|
| Purchase history / subscription status | Yes (plan, status, renewal date) | With RevenueCat (subscription management) and, implicitly, Google Play Billing (the actual payment processor) | Optional (Free plan works fully) | Determining Premium entitlement | We never see or store payment card details — only the resulting subscription state |
| Payment card details | Not collected by this app at all | Handled entirely by Google Play Billing | — | — | — |

## Device or other identifiers

| Field | Collected | Shared | Required? | Purpose | Notes |
|---|---|---|---|---|---|
| Advertising ID | Not collected | — | — | — | No ads SDK present |
| Device ID / IMEI / hardware identifiers | Not collected | — | — | — | No `expo-device`/`expo-application` device-identifier API is used anywhere in this codebase (verified by dependency/source search) |
| IP address | Not deliberately collected by app code | Transiently visible to Supabase/your AI provider's infrastructure as an artifact of any HTTPS request, same as any web/API call | — | — | Standard network-layer behavior, not something this app's code reads, stores, or acts on |

## Location

Not collected. No location-permission request, no `expo-location` dependency, exists anywhere in this app.

## Health / fitness

Not applicable — this app has no health or fitness data category.

## Web browsing

Not applicable — no in-app browser history tracking exists.

---

## Confirm-before-submission items (depend on your deployment configuration)

- **Which AI provider is "shared with"** in the Data Safety form depends on which of `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` you actually set as a live Supabase Edge Function secret for your production project — only list the one(s) you actually configure, not all three speculatively.
- **Whether RevenueCat/Google Play Billing rows are answered "shared"** depends on whether `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` is actually set for your production build — with it unset, no purchase data is ever shared with RevenueCat (the app runs in the safe "subscriptions not available" state — see `services/purchases/unavailableProvider.ts`).
- **Data deletion**: confirm the "Users can request that their data be deleted" toggle is set to Yes, and point Play Console's "how to request deletion" field at wherever you end up hosting `legal/site/account-deletion.html` (see README.md's "Legal pages" section — no URL exists yet, you must host it and paste the real link here).
- **"Is all of the user data collected by your app encrypted in transit?"** — every network call this app makes is over HTTPS (Supabase client, Edge Function calls, RevenueCat SDK) — verify this against your actual deployed Supabase project's configuration before answering Yes, rather than assuming.
- **Data retention/account-deletion completeness** — re-verify against README's "Account deletion (Edge Function)" section once `delete-account` is actually deployed to your production Supabase project; an undeployed function means user-requested deletion silently doesn't work yet (the client surfaces a clear error in that case — see `services/auth.ts`'s `deleteAccount()` — but Play's Data Safety answer should reflect actual production deployment status, not just code that exists).
