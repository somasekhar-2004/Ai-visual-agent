import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type Theme } from '@/constants/theme';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  const resolvedMode = preference === 'system' ? (systemScheme ?? 'light') : preference;
  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, preference, setPreference }),
    [theme, preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx.theme;
}

export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePreference must be used within a ThemeProvider');
  return { preference: ctx.preference, setPreference: ctx.setPreference };
}
