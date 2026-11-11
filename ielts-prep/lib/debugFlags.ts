/**
 * TEMPORARY — diagnostic flag for the "button taps only respond near the
 * centre" investigation (Check answer vs Next question). The earlier
 * structural fix (de-nesting ScrollViews in app/practice-session.tsx) did
 * NOT resolve it on a real device, so rather than guess a third root cause
 * blindly, this turns on a visible overlay (see components/ui/Button.tsx)
 * showing each button's REAL measured touch bounds — a dashed border drawn
 * on the Pressable's own box, corner markers to aim taps precisely at, and
 * a live tap counter that increments on every touch the Pressable actually
 * captures. Comparing where a tap physically lands against the drawn
 * border, and whether the counter moves, tells us directly whether this is
 * a frame/hit-test mismatch or something else (e.g. an overlapping view)
 * stealing the touch first.
 *
 * Must be set back to `false` once the bug is actually diagnosed from a
 * real device using a build with this on — not meant to ship in a normal
 * build.
 */
export const DEBUG_TOUCH_BOUNDS = true;

/**
 * TEMPORARY — a real device report said the compact Check-answer change
 * (shipped as the fix for DEBUG_TOUCH_BOUNDS's bug above) "isn't visible"
 * on an installed build. Before shipping another layout guess, this turns
 * on a visible on-screen banner (see components/debug/BuildDiagnostics.tsx,
 * rendered from app/practice-session.tsx) showing three independently
 * verifiable facts, so a report like that can be checked against ground
 * truth instead of assumed either way:
 *   - the NATIVE version code actually installed on the device right now
 *     (expo-application's Application.nativeBuildVersion — read from the
 *     installed APK's own manifest at runtime, not from anything this JS
 *     bundle could get wrong or go stale on its own);
 *   - the git commit this exact JS bundle was built from (EAS Build sets
 *     EAS_BUILD_GIT_COMMIT_HASH itself during the Build phase — the same
 *     value `eas build:view`'s own "Commit" column already shows for every
 *     build — baked in via app.config.js's `extra.gitCommitHash`, read back
 *     through expo-constants);
 *   - whether an OTA update could be involved at all: it can't — this app
 *     has no expo-updates dependency (only expo-updates-interface, an
 *     inert type-only package something else depends on) and no
 *     "updates"/"runtimeVersion" config, so nothing in this app can ever
 *     fetch or apply a remote JS bundle. The banner states this plainly
 *     rather than leaving it as something to take on faith.
 *
 * Must be set back to `false` once this round's report is actually
 * resolved — not meant to ship in a normal build.
 */
export const SHOW_BUILD_DIAGNOSTICS = true;
