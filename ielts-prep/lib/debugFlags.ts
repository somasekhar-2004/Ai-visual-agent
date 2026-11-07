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
