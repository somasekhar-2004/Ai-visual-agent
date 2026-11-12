import { render } from '@testing-library/react-native';

import { TranscriptAudioPlayer } from '@/components/testing/TranscriptAudioPlayer';
import { audioRegistry } from '@/lib/content/audioRegistry';
import { ThemeProvider } from '@/hooks/useTheme';

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() }),
  useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
}));

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));

// TranscriptAudioPlayer pulls in components/ui's barrel, which transitively
// imports expo-router (for DailyLimitCard's navigation) — and expo-router's
// real module chain includes an ESM-only package Jest can't require() as
// CommonJS. Mock it out, same as the other tests exercising this component.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

function treeIncludes(toJSON: () => unknown, text: string): boolean {
  return JSON.stringify(toJSON()).includes(text);
}

// A legacy Astra track id: audioRegistry still bundles its original,
// license-undocumented .mp3 (so the app never ships with a dangling
// require()), but no ListeningTrack ever sets audioSource for it — see
// listeningAstra.ts's header comment. Real users must never hear that file.
const UNLICENSED_TRACK_ID = '81000000-0000-0000-0000-000000000001';
// A production track with a real, licence-validated audioSource.
const LICENSED_TRACK_ID = '30000000-0000-0000-0000-000000000001';

describe('TranscriptAudioPlayer — never plays bundled audio for a track without a licence-validated audioSource', () => {
  it('has a real registry entry for the unlicensed track (so this test is exercising the real gap, not a fixture gap)', () => {
    expect(audioRegistry[UNLICENSED_TRACK_ID]).toBeDefined();
  });

  it('falls back to on-device TTS for a track with real bundled audio but hasLicensedAudio=false', async () => {
    const { toJSON } = await render(
      <ThemeProvider>
        <TranscriptAudioPlayer
          trackId={UNLICENSED_TRACK_ID}
          hasLicensedAudio={false}
          title="Booking a community course"
          transcript="Some transcript text."
        />
      </ThemeProvider>
    );
    expect(treeIncludes(toJSON, 'on-device text-to-speech')).toBe(true);
  });

  it('uses the real bundled audio player when hasLicensedAudio=true and the registry has the asset', async () => {
    const { toJSON } = await render(
      <ThemeProvider>
        <TranscriptAudioPlayer
          trackId={LICENSED_TRACK_ID}
          hasLicensedAudio
          title="Booking a Self-Storage Unit"
          transcript="Some transcript text."
        />
      </ThemeProvider>
    );
    expect(treeIncludes(toJSON, 'on-device text-to-speech')).toBe(false);
  });

  it('still falls back safely when hasLicensedAudio=true but the registry has no asset for the id (never crashes)', async () => {
    const { toJSON } = await render(
      <ThemeProvider>
        <TranscriptAudioPlayer trackId="nonexistent-id" hasLicensedAudio title="Untitled" transcript="Some transcript text." />
      </ThemeProvider>
    );
    expect(treeIncludes(toJSON, 'on-device text-to-speech')).toBe(true);
  });
});
