// Dynamic layer on top of the static app.json — Expo reads app.json first
// and passes it in here as `config`, letting us extend it with values only
// known at build time without hand-duplicating the rest of the config.
//
// This exists solely to surface which commit's JS is actually running
// inside a given build, on-device — see lib/debugFlags.ts's
// SHOW_BUILD_DIAGNOSTICS, which renders it on the practice-session screen.
// A report that a just-shipped change "isn't visible" on a freshly
// installed build needs this to tell apart "the build doesn't contain the
// change" from "the build does contain it, and something else is wrong."
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    // EAS Build sets this itself during the Build phase — computed by
    // eas-cli from the local git HEAD at upload time, the exact same value
    // `eas build:view`'s own "Commit" column already shows for every build
    // in this engagement. Never set by hand, so it can't go stale on its
    // own; null only when building outside EAS (e.g. a bare local
    // `expo start`), which this field's own display handles explicitly.
    gitCommitHash: process.env.EAS_BUILD_GIT_COMMIT_HASH || 'unknown',
  },
});
