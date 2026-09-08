import { darkColors, lightColors, skillColors, type ThemeColors } from './colors';
import { radius } from './radius';
import { makeShadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export type Theme = {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: ReturnType<typeof makeShadows>;
  skillColors: typeof skillColors;
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadows: makeShadows('#0B0F17'),
  skillColors,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  radius,
  typography,
  shadows: makeShadows('#000000'),
  skillColors,
};

export { skillColors };
export type { SkillKey } from './colors';
