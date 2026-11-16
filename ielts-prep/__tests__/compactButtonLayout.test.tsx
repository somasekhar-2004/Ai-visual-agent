import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { CompactButton } from '@/components/ui/CompactButton';
import { ThemeProvider } from '@/hooks/useTheme';

// Regression coverage for the accepted compact/centred edge-tap workaround
// (KNOWN_ISSUES.md). This is NOT a test that the underlying touch bug is
// fixed — it only locks in the workaround's layout so it can't silently
// regress: compact (no 100% width), centred, >=48dp tall, 12dp hitSlop,
// and long labels wrap centred instead of clipping.

async function renderButton(ui: React.ReactElement, label: string) {
  const utils = await render(<ThemeProvider>{ui}</ThemeProvider>);
  const text = utils.getByText(label);
  // Host tree: label Text -> Pressable's host View -> CompactButton wrapper View.
  const pressable = text.parent!;
  return {
    utils,
    pressable,
    labelStyle: StyleSheet.flatten(text.props.style),
    style: StyleSheet.flatten(pressable.props.style),
    wrapperStyle: StyleSheet.flatten(pressable.parent?.props.style),
  };
}

describe('CompactButton — accepted edge-tap workaround layout', () => {
  it('is compact and centred, never full width', async () => {
    const { style, wrapperStyle } = await renderButton(<CompactButton label="Continue" onPress={() => {}} />, 'Continue');
    expect(style.width).toBeUndefined();
    expect(style.paddingHorizontal).toBe(32);
    expect(wrapperStyle).toMatchObject({ alignItems: 'center' });
  });

  it('stays comfortably tappable: >=48dp tall with the 12dp hitSlop', async () => {
    const { pressable, style } = await renderButton(<CompactButton label="Continue" onPress={() => {}} />, 'Continue');
    expect(style.minHeight).toBeGreaterThanOrEqual(48);
    expect(pressable.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
  });

  it('lets a long label wrap centred and grow, capped at the screen width', async () => {
    const label = 'Already have an account? Sign in';
    const { style, labelStyle } = await renderButton(<CompactButton label={label} onPress={() => {}} />, label);
    expect(style.height).toBeUndefined();
    expect(style.maxWidth).toBe('100%');
    expect(labelStyle).toMatchObject({ textAlign: 'center', flexShrink: 1 });
  });

  it('preserves onPress, disabled and loading behaviour', async () => {
    const onPress = jest.fn();
    const ui = (props: Partial<React.ComponentProps<typeof CompactButton>>) => (
      <ThemeProvider>
        <CompactButton label="Continue" onPress={onPress} {...props} />
      </ThemeProvider>
    );
    const enabled = await render(ui({}));
    await fireEvent.press(enabled.getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
    await enabled.unmount();

    const disabled = await render(ui({ disabled: true }));
    await fireEvent.press(disabled.getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
    await disabled.unmount();

    const loading = await render(ui({ loading: true }));
    expect(loading.queryByText('Continue')).toBeNull();
    await loading.unmount();
  });
});

describe('Button — default layout unchanged (control case, e.g. "Next question")', () => {
  it('keeps its fixed height and full width when wrapLabel is not set', async () => {
    const { style, labelStyle } = await renderButton(
      <Button label="Next question" onPress={() => {}} fullWidth />,
      'Next question'
    );
    expect(style.height).toBe(48);
    expect(style.width).toBe('100%');
    expect(style.maxWidth).toBeUndefined();
    expect(labelStyle.textAlign).toBeUndefined();
  });
});
