import { goalSetupRoute } from '@/lib/goalSetupNav';

// Regression coverage for a real production bug: an already-authenticated
// user pressing "Set up my goal" from Home was sent through the full
// unauthenticated onboarding wizard, which ends in a "Create your account"
// screen with no idea a session already exists — so the goal either never
// saved against their real account, or a confusing second sign-up got
// attempted mid-flow. goalSetupRoute is the fix: the exact navigation
// decision Home and the standalone Analytics screen now both make.
describe('goalSetupRoute', () => {
  it('an authenticated user (userId set) is routed to the shared goal-save screen — never signup/onboarding', () => {
    expect(goalSetupRoute('user-1')).toBe('/profile-edit');
  });

  it('a genuinely unauthenticated user (userId null) still gets the real onboarding wizard, which is where signup lives', () => {
    expect(goalSetupRoute(null)).toBe('/(onboarding)/ielts-type');
  });
});
