/**
 * Where Home's (and the standalone Analytics screen's) "Set up my goal" CTA
 * should navigate. This is the exact decision that fixes a real production
 * bug: an already-authenticated user pressing "Set up my goal" from Home
 * was sent through the full unauthenticated onboarding wizard, which ends
 * in a "Create your account" screen with no idea a session already
 * exists — so the goal they filled in either never saved against their
 * real account, or a confusing second sign-up got attempted mid-flow.
 *
 * Home (and Analytics) are only ever reached once app/index.tsx's
 * RootIndex has confirmed the user is both onboarded and signed in, so in
 * practice `userId` is always set by the time this runs — but the decision
 * is still made explicitly (not just relied on as an invariant) so an
 * authenticated user always lands on the exact same authoritative save
 * screen Settings → Edit profile & goals uses (app/profile-edit.tsx) —
 * one goal-save implementation, not two — while a genuinely
 * unauthenticated/new user (the `userId === null` case, which the real
 * onboarding wizard's own entry point at app/(onboarding)/welcome.tsx
 * still reaches directly) still gets the real sign-up flow.
 */
export function goalSetupRoute(userId: string | null): '/profile-edit' | '/(onboarding)/ielts-type' {
  return userId ? '/profile-edit' : '/(onboarding)/ielts-type';
}
