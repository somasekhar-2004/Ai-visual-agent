import React from 'react';
import { View } from 'react-native';

import { Button, type ButtonProps } from './Button';

/** The compact/centred Check-answer workaround (see KNOWN_ISSUES.md and
 * components/practice/QuestionCard.tsx), factored out so every other large
 * standalone button affected by the same unresolved edge-tap bug can use it
 * without `fullWidth`. Never pass `fullWidth` here — the point is to not be
 * full width. The wrapping View (rather than `alignSelf: 'center'` on the
 * Button alone) is deliberate — see QuestionCard.tsx's comment for why.
 * This is an accepted workaround, not a fix: it narrows the gap between a
 * tap and the button's own centre, it does not address the underlying
 * cause, which remains unknown. */
export function CompactButton({ style, ...props }: Omit<ButtonProps, 'fullWidth'>) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Button {...props} style={[{ paddingHorizontal: 32, minHeight: 48 }, style]} />
    </View>
  );
}
