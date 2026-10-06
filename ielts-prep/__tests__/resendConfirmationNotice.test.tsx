import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import { ResendConfirmationNotice } from '@/components/auth/ResendConfirmationNotice';
import { ThemeProvider } from '@/hooks/useTheme';
import { resendConfirmationEmail } from '@/services/auth';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/services/auth', () => ({
  resendConfirmationEmail: jest.fn(),
}));

const mockResend = resendConfirmationEmail as jest.Mock;

async function renderNotice(props: React.ComponentProps<typeof ResendConfirmationNotice>) {
  return render(
    <ThemeProvider>
      <ResendConfirmationNotice {...props} />
    </ThemeProvider>
  );
}

describe('ResendConfirmationNotice — sign-in navigation', () => {
  afterEach(() => jest.clearAllMocks());

  it('navigates to /(auth)/sign-in when "Sign in" is pressed', async () => {
    const { getByText } = await renderNotice({ email: 'a@b.com' });
    fireEvent.press(getByText('Sign in'));
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('shows "Email not confirmed yet" copy when alreadyRegistered is set', async () => {
    const { getByText } = await renderNotice({ email: 'a@b.com', alreadyRegistered: true });
    expect(getByText('Email not confirmed yet')).toBeTruthy();
  });

  it('shows the brand-new-signup copy by default', async () => {
    const { getByText } = await renderNotice({ email: 'a@b.com' });
    expect(getByText('Check your email to confirm your account')).toBeTruthy();
  });
});

// Regression coverage for the release-blocking real-device bug: tapping
// "Resend confirmation email" did not reliably send another email. Audit
// found handleResend had no try/catch — a thrown rejection (e.g. a genuine
// network failure) left the button stuck showing "Sending…" forever, since
// the code that would flip status back out of 'sending' never ran. Both the
// UI (this file) and services/auth.ts's resendConfirmationEmail itself
// (see authRealMode.test.ts) are now covered against this.
describe('ResendConfirmationNotice — resend button behavior', () => {
  afterEach(() => jest.clearAllMocks());

  it('calls resendConfirmationEmail with the pending email and shows success feedback', async () => {
    mockResend.mockResolvedValue({ ok: true });
    const { getByText, unmount } = await renderNotice({ email: 'student@example.com' });

    fireEvent.press(getByText('Resend confirmation email'));

    expect(mockResend).toHaveBeenCalledWith('student@example.com');
    await waitFor(() => expect(getByText(/Confirmation email sent again/)).toBeTruthy());
    // A successful resend starts the cooldown's setInterval — unmount to
    // clear it (the component's own cleanup effect handles this) rather
    // than leaking a live timer past the end of this test.
    unmount();
  });

  it('shows a rate-limit message and starts the cooldown from the exact server-reported wait time', async () => {
    mockResend.mockResolvedValue({ ok: false, error: 'Please wait 42 seconds before requesting another email.', retryAfterSeconds: 42 });
    const { getByText, unmount } = await renderNotice({ email: 'student@example.com' });

    fireEvent.press(getByText('Resend confirmation email'));

    await waitFor(() => expect(getByText('Please wait 42 seconds before requesting another email.')).toBeTruthy());
    expect(getByText('Resend available in 42s')).toBeTruthy();
    unmount(); // clears the cooldown interval this test started — see above
  });

  it('shows a generic error message for a non-rate-limit failure (e.g. already confirmed)', async () => {
    mockResend.mockResolvedValue({ ok: false, error: 'Email already confirmed' });
    const { getByText } = await renderNotice({ email: 'student@example.com' });

    fireEvent.press(getByText('Resend confirmation email'));

    await waitFor(() => expect(getByText('Email already confirmed')).toBeTruthy());
    // No cooldown for a plain failure — the button must be tappable again immediately.
    expect(getByText('Resend confirmation email')).toBeTruthy();
  });

  it('never gets stuck on "Sending…" if resendConfirmationEmail rejects outright (network failure)', async () => {
    mockResend.mockRejectedValue(new Error('Network request failed'));
    const { getByText, queryByText } = await renderNotice({ email: 'student@example.com' });

    fireEvent.press(getByText('Resend confirmation email'));

    await waitFor(() => expect(queryByText('Sending…')).toBeNull());
    expect(getByText('Network request failed')).toBeTruthy();
    // The button must be re-enabled (not stuck disabled forever) — it's
    // back to its normal label, not permanently showing the spinner state.
    expect(getByText('Resend confirmation email')).toBeTruthy();
  });

  // These two use REAL timers and really wait out RESEND_TIMEOUT_MS (15s):
  // jest.useFakeTimers() here reliably corrupted the test *renderer* itself
  // (a subsequent, unrelated test in this same file rendered as a bare
  // empty tree) — a Jest/RTL/mocked-AsyncStorage interaction that didn't
  // reduce to something safely fixable in this change without risking the
  // rest of the suite, so this trades test speed for not touching that
  // interaction at all. Both get a longer per-test timeout accordingly.
  it(
    'times out rather than hanging on "Sending…" forever if resendConfirmationEmail never settles, and re-enables immediately for a retry',
    async () => {
      mockResend.mockReturnValue(new Promise(() => {})); // never settles — simulates a wedged/stalled request
      const { getByText, queryByText } = await renderNotice({ email: 'student@example.com' });

      await fireEvent.press(getByText('Resend confirmation email'));
      // Button.tsx swaps the label for a bare spinner while loading={true}
      // (see other tests' own comment on this) — the idle label's absence
      // is what proves the button actually entered the sending state.
      expect(queryByText('Resend confirmation email')).toBeNull();

      await waitFor(() => expect(getByText(/taking longer than expected/)).toBeTruthy(), { timeout: 17_000 });
      // Re-enabled, not stuck — the exact behavior the original bug ("only
      // fixed by closing and reopening the app") was missing.
      expect(getByText('Resend confirmation email')).toBeTruthy();
    },
    20_000
  );

  it(
    'a late response from a timed-out attempt cannot overwrite the state of a newer retry',
    async () => {
      let resolveFirst!: (value: { ok: boolean }) => void;
      mockResend
        .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; })) // first call: never settles until we say so, well past its own timeout
        .mockResolvedValueOnce({ ok: false, error: 'Please wait 42 seconds before requesting another email.', retryAfterSeconds: 42 }); // second call (the retry): a real, different outcome

      const { getByText, queryByText, unmount } = await renderNotice({ email: 'student@example.com' });

      await fireEvent.press(getByText('Resend confirmation email'));
      await waitFor(() => expect(getByText(/taking longer than expected/)).toBeTruthy(), { timeout: 17_000 }); // first attempt times out client-side

      await fireEvent.press(getByText('Resend confirmation email')); // retry — the second, genuinely new request
      await waitFor(() => expect(getByText('Please wait 42 seconds before requesting another email.')).toBeTruthy());

      // The first request's real network call was never cancelled (see
      // RESEND_TIMEOUT_MS's comment — supabase-js's resend() exposes no
      // abort signal) and only now "arrives" — it must be silently ignored,
      // never stomping the retry's own, newer, already-displayed outcome.
      await act(async () => {
        resolveFirst({ ok: true });
      });
      expect(getByText('Please wait 42 seconds before requesting another email.')).toBeTruthy();
      expect(queryByText(/Confirmation email sent again/)).toBeNull();
      unmount(); // the retry's cooldown started a real setInterval — see other tests' own comment on this
    },
    20_000
  );

  it('does not allow a second resend while one is already in flight (loading disables the button)', async () => {
    let resolveResend!: (value: { ok: boolean }) => void;
    mockResend.mockReturnValue(new Promise((resolve) => { resolveResend = resolve; }));
    const { getByText } = await renderNotice({ email: 'student@example.com' });

    // Same element reference for both presses: once the first press's
    // setStatus('sending') re-renders the underlying Button with
    // loading=true, Button.tsx computes isDisabled = disabled || loading
    // and the Pressable itself ignores further presses — the button swaps
    // its label for a spinner while loading, so it can no longer be
    // re-queried by its idle label text at this point.
    const button = getByText('Resend confirmation email');
    fireEvent.press(button);
    fireEvent.press(button); // a rapid second tap while the first is still in flight

    expect(mockResend).toHaveBeenCalledTimes(1);
    resolveResend({ ok: true });
    await waitFor(() => expect(mockResend).toHaveBeenCalledTimes(1));
  });
});
