# Privacy Policy — IELTS Prep

**Last updated:** 2026-09-18

**Placeholders you must fill in before this is legally usable** (search for `[` in this document): the legal entity/owner name, business address, and a reviewed contact email. Have this reviewed by counsel for your specific jurisdiction and business structure before relying on it publicly — this draft describes what the app's code actually does today; it is not legal advice.

This policy describes what **IELTS Prep** ("the app", "we", "us") actually collects, stores, and does with your data. It is written from an audit of the app's real code, not a generic template — every claim below is something the current implementation actually does.

## 1. Who this policy covers

This policy applies to the IELTS Prep mobile app. It is operated by **[Company/Owner Legal Name — placeholder]**, **[Business Address — placeholder]**. Contact: **[support@ieltsprep.app — confirm this mailbox is actually monitored, or replace with your real support address]**.

## 2. Two modes the app can run in

- **Demo Mode** (no backend configured): every piece of data described below stays entirely on your device, in local on-device storage. Nothing is sent to us or any third party except the AI providers used for evaluation/transcription (see §4), and even that only happens if you use a feature that calls one.
- **Signed-in Mode** (a real account, via Supabase): the same categories of data are stored in our database, in rows scoped to your account and isolated from other users by database-level access rules (Row Level Security) — no other user can read or write your data.

## 3. What we collect and why

| Data | Why we collect it |
|---|---|
| Email address, display name | Account identity, sign-in, personalizing greetings |
| IELTS target band, current band estimate, exam date, weakest skill, daily study-time preference | Building your study plan and progress dashboard |
| Practice/test attempts (Reading, Listening, Writing, Speaking), Full Mock attempts and scores | Showing your progress, computing band estimates, powering AI Coach's grounded context |
| Written essay text and Speaking transcripts you submit for evaluation | Generating AI feedback (Writing/Speaking evaluation) |
| Vocabulary/grammar progress, bookmarks, achievements, streak, XP | Progress tracking and gamification features |
| AI Coach chat messages | Continuing your coaching conversation, generating replies |
| Subscription plan/status | Determining Premium access |
| Daily AI-usage counts (which operation, whether it succeeded, timestamp — not the content itself) | Enforcing free/premium daily usage limits server-side, abuse prevention |

We do not collect data we don't have a specific, described use for above, and we do not sell your data to anyone.

## 4. Third parties that actually process your data

These are the only third-party services this app's code actually integrates with:

- **Supabase** (database, authentication, serverless functions) — the backend that stores your account and app data when the app is in Signed-in Mode, and runs the server-side logic (evaluation requests, quota checks, account deletion, subscription sync).
- **AI providers** — depending on which key is configured on our server (never more than one active provider at a time, and configuration is server-side only): **OpenAI**, **Anthropic**, or **Google (Gemini)**. When you submit a Writing essay or a Speaking recording for evaluation, ask the AI Coach a question, or request a study-plan suggestion, the relevant text (and, for Speaking, the transcribed text — see §5) is sent to whichever provider is configured, solely to generate that response. We do not control what that provider does with the request after processing beyond what their own privacy policy states; see [OpenAI's privacy policy](https://openai.com/policies/privacy-policy), [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy), or [Google's privacy policy](https://policies.google.com/privacy) depending on which is active for your build.
- **RevenueCat** — if configured, manages subscription/purchase state. Your Google Play purchase receipt and subscription status are shared with RevenueCat to validate your entitlement; RevenueCat's own policy is at [revenuecat.com/privacy](https://www.revenuecat.com/privacy/).
- **Google Play Billing** — the actual payment processor for any purchase; we never see or store your payment card details, only the resulting subscription status.

We do not use any crash-reporting, analytics, or advertising SDK — none is present in this app's dependencies as of this policy's last-updated date.

## 5. Microphone and audio recordings (Speaking practice)

When you use a Speaking practice or Full Mock feature, the app records audio via your device's microphone **only while you are actively recording a response you started** — never in the background, and never before you take that explicit action. The recording is temporarily held on your device, then:

1. Uploaded (as part of the transcription request) to our server-side Edge Function, which forwards it to the configured AI provider to produce a text transcript.
2. That transcript (not the raw audio) is what gets evaluated for Speaking feedback.

We do not upload your audio to any persistent server-side storage bucket — it is used for the single transcription request and not separately archived by our own infrastructure. We cannot make the same guarantee about the configured AI provider's own retention of a request it processed; see their policy linked in §4. The temporary local recording file is not proven to be deleted from your device immediately after upload in the current implementation — treat it as retained in the app's local storage until you close/reinstall the app or the OS reclaims that storage, not as immediately wiped.

## 6. AI-generated feedback — limitations

Every band score, evaluation, and piece of AI-generated feedback in this app (Writing, Speaking, AI Coach, study-plan suggestions) is an **estimate for practice purposes**, produced by a third-party AI model. It is:

- Not an official IELTS score.
- Not affiliated with, endorsed by, or produced by any organization that administers the real IELTS exam.
- Not guaranteed accurate — AI evaluation can be wrong, inconsistent between runs, or miss nuance a human examiner would catch.

## 7. Local device storage

Independent of any account, the app stores some data only on your device via local storage (not sent to us): in-progress onboarding wizard answers (so they survive an app restart mid-setup), draft essay text while you're writing (so a draft isn't lost if you leave the screen), and, in Demo Mode, your entire local dataset.

## 8. Notifications

If you enable them, the app schedules **local, on-device** reminder notifications (daily study reminder, streak reminder, weekly summary, exam countdown) using your device's own notification system. These are not push notifications routed through a remote server or third-party push service — no notification token is collected or sent to us. You can disable any notification category at any time in the app's notification settings, and the app works fully without notification permission granted.

## 9. Error logging

The app's own client and server code write diagnostic log lines (e.g. "failed to sync subscription", "provider call failed") for debugging. These are written to standard platform/Supabase function logs, not a dedicated third-party log-aggregation or crash-reporting service, and are reviewed only by us for debugging purposes.

## 10. Data retention and deletion

Your data is retained for as long as your account exists. You can permanently delete your account and all associated data at any time from **Profile → Delete account** (or Help & support → Delete account) in the app. Deletion:

- Removes your authentication record and every database row tied to your account — profile, goals, subscription, band scores, streak/XP, every practice/mock/question attempt, bookmarks, Writing/Speaking submissions and feedback, AI Coach conversations, study plan, vocabulary/grammar progress, achievements, and AI-usage log entries.
- Is immediate and irreversible — there is no "undo" or grace-period recovery once you confirm.
- May not remove data already sent to and retained by a third-party AI provider under a request processed before deletion (see §4) — that is governed by their own retention policy, outside our control.
- We may retain minimal records where legally required (e.g., for tax/financial record-keeping related to a completed subscription payment) for the period the law requires, even after account deletion.

If you can no longer sign in to request deletion from the app, see our external account-deletion request page: **[deletion request page URL — placeholder, see README.md's "Account deletion request page" section for what to host and where]**.

## 11. Children

This app is not directed at children under 13, and we do not knowingly collect personal information from anyone under 13. If you believe a child has provided us data, contact us at the address in §1 and we will delete it.

## 12. Your rights

Depending on your jurisdiction, you may have rights to access, correct, export, or delete your data, and to object to certain processing. Deletion is available directly in-app (§10). For any other request, contact us at the address in §1.

## 13. Changes to this policy

We may update this policy as the app changes. Continued use after an update means you accept the revised policy. The "Last updated" date at the top of this document reflects the most recent revision.

## 14. Contact

Questions about this policy: **[support@ieltsprep.app — placeholder, confirm/replace]**.
