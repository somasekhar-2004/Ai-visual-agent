// Regression coverage for the account-deletion flow (hooks/useAccountDeletion.ts)
// — the client-side half of Priority 1's deletion requirements. The
// server-side half (authenticated delete, cannot delete another user,
// deletion error surfaced cleanly) is covered by
// supabase/functions/_shared/deleteAccount.test.ts (Deno).
import { runAccountDeletion } from '@/lib/accountDeletion';

function makeDeps(overrides: Partial<Parameters<typeof runAccountDeletion>[0]> = {}) {
  return {
    confirm: jest.fn().mockResolvedValue(true),
    deleteAccount: jest.fn().mockResolvedValue({ ok: true }),
    signOut: jest.fn().mockResolvedValue(undefined),
    navigateToSignIn: jest.fn(),
    alert: jest.fn(),
    ...overrides,
  };
}

describe('runAccountDeletion', () => {
  it('declining the confirmation dialog never calls deleteAccount, signOut, or navigation', async () => {
    const deps = makeDeps({ confirm: jest.fn().mockResolvedValue(false) });
    await runAccountDeletion(deps);
    expect(deps.deleteAccount).not.toHaveBeenCalled();
    expect(deps.signOut).not.toHaveBeenCalled();
    expect(deps.navigateToSignIn).not.toHaveBeenCalled();
  });

  it('a successful deletion clears local state (signOut) and routes to the signed-out screen', async () => {
    const deps = makeDeps();
    await runAccountDeletion(deps);
    expect(deps.deleteAccount).toHaveBeenCalledTimes(1);
    // signOut (useAppStore.signOut) is what clears every piece of local app
    // state and logs the device out of RevenueCat's purchase identity — see
    // store/useAppStore.ts's own signOut() and
    // __tests__/subscriptionPurchaseFlow.test.ts's coverage of that call
    // chain. This test proves the deletion flow actually reaches it.
    expect(deps.signOut).toHaveBeenCalledTimes(1);
    expect(deps.navigateToSignIn).toHaveBeenCalledTimes(1);
    expect(deps.alert).not.toHaveBeenCalled();
  });

  it('signOut is called AFTER a successful server-side deletion, never before or on failure', async () => {
    const order: string[] = [];
    const deps = makeDeps({
      deleteAccount: jest.fn().mockImplementation(async () => {
        order.push('deleteAccount');
        return { ok: true };
      }),
      signOut: jest.fn().mockImplementation(async () => {
        order.push('signOut');
      }),
    });
    await runAccountDeletion(deps);
    expect(order).toEqual(['deleteAccount', 'signOut']);
  });

  it('a server-reported deletion failure is surfaced via alert — never silently signs the user out or navigates away', async () => {
    const deps = makeDeps({ deleteAccount: jest.fn().mockResolvedValue({ ok: false, message: 'Deployment required.' }) });
    await runAccountDeletion(deps);
    expect(deps.alert).toHaveBeenCalledWith('Could not delete account', 'Deployment required.');
    expect(deps.signOut).not.toHaveBeenCalled();
    expect(deps.navigateToSignIn).not.toHaveBeenCalled();
  });

  it('a failure with no message falls back to a generic, still-clear message', async () => {
    const deps = makeDeps({ deleteAccount: jest.fn().mockResolvedValue({ ok: false }) });
    await runAccountDeletion(deps);
    expect(deps.alert).toHaveBeenCalledWith('Could not delete account', 'Please try again later.');
  });

  it('a thrown network/unexpected error is caught and surfaced, never crashes the flow', async () => {
    const deps = makeDeps({ deleteAccount: jest.fn().mockRejectedValue(new Error('Network request failed')) });
    await runAccountDeletion(deps);
    expect(deps.alert).toHaveBeenCalledWith('Could not delete account', 'Network request failed');
    expect(deps.signOut).not.toHaveBeenCalled();
  });
});
