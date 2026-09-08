import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  fontFamily,
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h1: { fontSize: 26, lineHeight: 33, fontWeight: '700' as const },
  h2: { fontSize: 22, lineHeight: 29, fontWeight: '700' as const },
  h3: { fontSize: 18, lineHeight: 25, fontWeight: '600' as const },
  bodyLg: { fontSize: 17, lineHeight: 25, fontWeight: '400' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  micro: { fontSize: 11, lineHeight: 15, fontWeight: '600' as const },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' as const },
};

export type TypographyVariant = keyof Omit<typeof typography, 'fontFamily'>;
