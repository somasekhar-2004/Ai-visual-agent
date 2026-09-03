/**
 * EXPO_PUBLIC_-prefixed env vars are inlined into the JS bundle at build time by Expo (no extra
 * config needed, works the same in Expo Go and dev builds) - see .env.example for how to set this
 * to your Mac's LAN IP so a physical device on the same network can reach the Next.js backend.
 */
const raw = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!raw) {
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env and set it to your backend's " +
      "LAN URL (e.g. http://192.168.1.23:3000), then restart `npx expo start` (env vars are only " +
      "read at bundle-build time, not hot-reloaded).",
  );
}

// Strip any trailing slash so callers can safely do `${API_BASE_URL}/api/analyze`.
export const API_BASE_URL = raw.replace(/\/+$/, "");
