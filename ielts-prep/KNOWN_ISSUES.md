# Known Issues

## Check-answer button: edge taps don't register (unresolved)

**Status:** Confirmed on-device on build 31, still unresolved. Workaround shipped, root cause unknown.

**Symptom:** In Reading and Listening Quick Practice, tapping the centre of the
"Check answer" button reveals the answer as expected, but tapping just inside
its visible left or right edge does nothing. The "Next question" button
(`fullWidth`, same `Button` component) does not have this problem — its
edges respond normally.

**What's been tried:**
- Removed `fullWidth` and made the button compact/centred instead
  (`components/practice/QuestionCard.tsx`) — reduces how often the bug is
  hit (less distance between centre and edge) but does not fix it; edge
  taps on this narrower button still fail.
- Added `hitSlop` of 12dp on all sides to every `Button` (`components/ui/Button.tsx`)
  as a standing mitigation — expands the registered touch region outward,
  cannot make a correct hit area worse, but did not resolve the edge-tap
  failure either.
- Verified via code review and `@testing-library/react-native` component-tree
  inspection that the resolved styles are correct: no explicit width is set
  on the compact button, `alignSelf`/the wrapping `alignItems: 'center'`
  View is present, and the Pressable's `backgroundColor` and `onPress` are
  on the same element (no overlay mismatch).
- Shipped on-device diagnostics (build 31: native version code, JS commit
  hash, OTA-impossibility check, live width readout) to rule out a stale
  install or OTA update as the explanation — confirmed build 31 was the
  exact code running when the bug was reproduced. Diagnostics have since
  been removed from the app (this issue file replaces them as the record).

**What hasn't been tried / possible next steps:**
- No Android device or emulator is available in the development
  environment used for this investigation, so the bug cannot be reproduced
  or debugged directly — all verification so far has been code-level
  (static analysis, RTL component-tree snapshots) or by instrumenting a
  real build and reading back the user's on-device report.
- Possible remaining causes not yet ruled out: a platform/RN-version-specific
  `Pressable` hit-testing quirk with small/narrow boxes, a parent
  `ScrollView` or gesture responder intercepting edge touches before they
  reach the Pressable, or an Android-specific touch-slop/ripple-boundary
  behavior that differs from the `fullWidth` case.

**Current state:** The compact/centred layout (`QuestionCard.tsx`) and the
12dp `hitSlop` (`Button.tsx`) are accepted as permanent workarounds for now,
not removed, since they reduce (without eliminating) how often the bug is
hit. Do not revert them without reproducing and fixing the underlying cause
first.
