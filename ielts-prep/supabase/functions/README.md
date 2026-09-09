# Supabase Edge Functions

Server-side AI boundary for the IELTS Prep app — see the root `README.md`'s
"AI provider setup" section for the full deploy walkthrough and the
request/response contract every function follows. This directory is **not**
part of the Expo/React Native app: it runs on Deno, not Node/Metro, which is
why it's excluded from the root `tsconfig.json` and `eslint.config.js`.

## Layout

- `_shared/` — auth verification, Zod request/response schemas, rate
  limiting, the actual OpenAI/Anthropic/Gemini HTTP calls, and prompt
  builders. Every function imports from here rather than duplicating this
  logic. `_shared/aiProviders.test.ts` is this directory's one test file —
  see "Type-checking, linting, and testing" below.
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

## Type-checking, linting, and testing

These files are plain TypeScript but run on Deno's runtime and module
resolution (`npm:` specifiers, `Deno.serve`, `Deno.env`), which the repo's
Node-based `tsc`/`eslint`/`jest` cannot resolve — that's why the root
`tsconfig.json`/`eslint.config.js` exclude `supabase/functions/**`, and
`jest.config.js`'s `testPathIgnorePatterns` excludes it too (a `.test.ts`
file here uses `Deno.test`, which Jest doesn't understand — never rename it
to something Jest would try to collect). If you have the Deno CLI
installed, check this directory on its own:

```bash
deno check supabase/functions/**/*.ts
deno lint supabase/functions
deno test --allow-env --allow-read --node-modules-dir=none supabase/functions/_shared/aiProviders.test.ts
```

Do **not** pass `--node-modules-dir=auto` to any Deno command run from
inside this repo — it makes Deno reorganize the project's npm-managed
`node_modules` into its own `.deno`-vendored layout, which breaks Jest for
the rest of the repo until you `rm -rf node_modules && npm install` again.
`--node-modules-dir=none` (or omitting the flag) resolves `npm:` specifiers
against the existing `node_modules` without touching it.

None of this is required to build or test the mobile app; it's a
Deno-specific complement to the app's own `npm run typecheck` / `npm run
lint` / `npm test`, which cover everything else in the repo.
