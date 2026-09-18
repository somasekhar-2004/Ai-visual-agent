import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { runAccountDeletion } from '@/lib/accountDeletion';
import { confirmAsync } from '@/lib/confirm';
import { deleteAccount } from '@/services/auth';
import { useAppStore } from '@/store/useAppStore';

export function useAccountDeletion() {
  const router = useRouter();
  const signOut = useAppStore((s) => s.signOut);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await runAccountDeletion({
        confirm: () =>
          confirmAsync(
            'Delete account',
            'This permanently deletes your profile, progress, and test history. This cannot be undone.',
            'Delete account'
          ),
        deleteAccount,
        signOut,
        navigateToSignIn: () => router.replace('/(auth)/sign-in'),
        alert: (title, message) => Alert.alert(title, message),
      });
    } finally {
      setDeleting(false);
    }
  }

  return { deleting, confirmDelete };
}
