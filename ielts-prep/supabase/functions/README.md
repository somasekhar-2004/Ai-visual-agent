# Supabase Edge Functions

Server-side AI boundary for the IELTS Prep app — see the root `README.md`'s
"AI provider setup" section for the full deploy walkthrough and the
request/response contract every function follows. This directory is **not**
part of the Expo/React Native app: it runs on Deno, not Node/Metro, which is
why it's excluded from the root `tsconfig.json` and `eslint.config.js`.

## Layout

- `_shared/` — auth verification, Zod request/response schemas, rate
  limiting, the actual OpenAI/Anthropic HTTP calls, and prompt builders.
  Every function imports from here rather than duplicating this logic.
- `evaluate-writing/`, `evaluate-speaking/`, `ai-coach/`, `transcribe-audio/`,
  `study-plan-suggestion/` — one Edge Function per AI operation, each a thin
  `index.ts` that wires the shared helpers together in the same order:
  auth → validate → check provider configured → check rate limit → call the
  provider → validate its output → log usage → respond.

## Local development

```bash
npx supabase functions serve --env-file supabase/functions/.env
```

(after copying `.env.example` to `.env` in this directory with real keys —
never commit that file). This runs every function locally against your
linked Supabase project's database, so auth/RLS/rate-limiting all behave
the same as in production.

## Type-checking and linting

These files are plain TypeScript but run on Deno's runtime and module
resolution (`npm:` specifiers, `Deno.serve`, `Deno.env`), which the repo's
Node-based `tsc`/`eslint` cannot resolve — that's why both configs exclude
`supabase/functions/**`. If you have the Deno CLI installed, check this
directory on its own:

```bash
deno check supabase/functions/**/*.ts
deno lint supabase/functions
```

Neither is required to build or test the mobile app; they're a
Deno-specific complement to the app's own `npm run typecheck` / `npm run
lint`, which cover everything else in the repo.
