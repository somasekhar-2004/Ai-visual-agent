// Semantic color palette. Keep tones muted and academic — no candy gradients.
export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  blue50: '#EEF3FF',
  blue100: '#DCE6FF',
  blue300: '#8FACF7',
  blue500: '#2F5DE3',
  blue600: '#2749BE',
  blue700: '#1F3A96',

  navy900: '#0B0F17',
  navy800: '#141A24',
  navy700: '#1C2431',
  navy600: '#2A3444',

  slate50: '#F7F8FB',
  slate100: '#EEF0F4',
  slate200: '#E4E7EC',
  slate300: '#CBD1DB',
  slate400: '#9AA3B2',
  slate500: '#6B7482',
  slate600: '#4B5563',
  slate700: '#333B47',
  slate900: '#12151C',

  green500: '#1D9A6C',
  green600: '#167F58',
  amber500: '#C98A1B',
  amber600: '#A66F13',
  red500: '#D64545',
  red600: '#B73A3A',

  teal500: '#1B9C9C',
  purple500: '#7C5CE0',
  coral500: '#E2694F',
} as const;

export type SkillKey = 'listening' | 'reading' | 'writing' | 'speaking';

export const skillColors: Record<SkillKey, string> = {
  listening: palette.teal500,
  reading: palette.blue500,
  writing: palette.purple500,
  speaking: palette.coral500,
};

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  overlay: string;
  skeleton: string;
  tabBarBackground: string;
  tabBarInactive: string;
};

export const lightColors: ThemeColors = {
  background: palette.slate50,
  surface: palette.white,
  surfaceAlt: palette.slate100,
  border: palette.slate200,
  borderStrong: palette.slate300,

  textPrimary: palette.slate900,
  textSecondary: palette.slate600,
  textTertiary: palette.slate400,
  textInverse: palette.white,

  primary: palette.blue500,
  primaryPressed: palette.blue600,
  primarySoft: palette.blue50,
  onPrimary: palette.white,

  success: palette.green500,
  successSoft: '#E6F5EF',
  warning: palette.amber500,
  warningSoft: '#FBF0DE',
  error: palette.red500,
  errorSoft: '#FBEAEA',

  overlay: 'rgba(11, 15, 23, 0.45)',
  skeleton: palette.slate100,
  tabBarBackground: palette.white,
  tabBarInactive: palette.slate400,
};

export const darkColors: ThemeColors = {
  background: palette.navy900,
  surface: palette.navy800,
  surfaceAlt: palette.navy700,
  border: palette.navy600,
  borderStrong: '#3A4457',

  textPrimary: '#F3F5F9',
  textSecondary: '#AEB6C4',
  textTertiary: '#7C8598',
  textInverse: palette.slate900,

  primary: palette.blue300,
  primaryPressed: '#A9C0FA',
  primarySoft: 'rgba(143, 172, 247, 0.16)',
  onPrimary: palette.navy900,

  success: '#3FC28E',
  successSoft: 'rgba(63, 194, 142, 0.14)',
  warning: '#E0A83F',
  warningSoft: 'rgba(224, 168, 63, 0.14)',
  error: '#E5726F',
  errorSoft: 'rgba(229, 114, 111, 0.14)',

  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: palette.navy700,
  tabBarBackground: palette.navy800,
  tabBarInactive: '#5E6980',
};
