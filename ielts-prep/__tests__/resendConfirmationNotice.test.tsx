import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { ResendConfirmationNotice } from '@/components/auth/ResendConfirmationNotice';
import { ThemeProvider } from '@/hooks/useTheme';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

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
