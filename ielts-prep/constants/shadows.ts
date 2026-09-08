import { Platform } from 'react-native';

// Soft, low-elevation shadows for a calm premium feel. Android uses elevation.
export function makeShadows(shadowColor: string) {
  return {
    none: {},
    sm: Platform.select({
      ios: {
        shadowColor,
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
      default: {},
    }),
    md: Platform.select({
      ios: {
        shadowColor,
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
      default: {},
    }),
    lg: Platform.select({
      ios: {
        shadowColor,
        shadowOpacity: 0.14,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
      default: {},
    }),
  };
}
