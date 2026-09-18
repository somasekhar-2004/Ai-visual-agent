export type AccountDeletionDeps = {
  confirm: () => Promise<boolean>;
  deleteAccount: () => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  navigateToSignIn: () => void;
  alert: (title: string, message: string) => void;
};

/** The actual confirm→delete→clean-up→route sequence for account deletion,
 * taking every dependency as a parameter so it's directly unit-testable
 * (see __tests__/accountDeletion.test.ts) with no expo-router/Alert/
 * Supabase involved at all. hooks/useAccountDeletion.ts is a thin wrapper
 * that supplies the real ones for actual screens to use.
 *
 * Deliberately requires a real, deliberate confirmation before doing
 * anything irreversible — `confirm()` must resolve true (the user picked
 * the destructive action by name, not a generic "OK") before any network
 * call is made. After the server confirms deletion, `signOut()` clears
 * every piece of local app state AND (see useAppStore.signOut's own
 * implementation) logs the device out of RevenueCat's purchase identity,
 * before finally routing to the signed-out screen. */
export async function runAccountDeletion(deps: AccountDeletionDeps): Promise<void> {
  const confirmed = await deps.confirm();
  if (!confirmed) return;
  try {
    const result = await deps.deleteAccount();
    if (!result.ok) {
      deps.alert('Could not delete account', result.message ?? 'Please try again later.');
      return;
    }
    await deps.signOut();
    deps.navigateToSignIn();
  } catch (err) {
    deps.alert('Could not delete account', (err as Error).message);
  }
}
