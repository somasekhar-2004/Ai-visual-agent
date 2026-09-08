import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog. `Alert.alert` is a no-op on web (see
 * react-native-web's Alert stub), so this falls back to `window.confirm`
 * there and uses the native Alert everywhere else.
 */
export function confirmAsync(title: string, message: string, confirmLabel = 'OK'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' ? window.confirm(`${title}\n\n${message}`) : false);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
