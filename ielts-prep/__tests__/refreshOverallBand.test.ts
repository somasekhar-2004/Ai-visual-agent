import { supabase } from '@/lib/supabase';
import { refreshOverallBand } from '@/services/repository/core';

// Regression coverage for Critical Issue 5 (overall-band fabrication):
// refreshOverallBand used to default every missing skill band to 6, so a
// brand-new user who completed onboarding but had never attempted a single
// test still got a recorded, displayed "Overall Band 6.0" — invented from
// nothing. It must now refuse to compute (or record) an overall band until
// all four skills have a genuine recorded score.
jest.mock('@/lib/env', () => ({
  ...jest.requireActual('@/lib/env'),
  isDemoMode: false,
  isSupabaseConfigured: true,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {};
  for (const method of ['select', 'insert', 'update', 'eq', 'order']) builder[method] = jest.fn().mockReturnValue(builder);
  builder.then = (resolve: (v: any) => void) => resolve(result);
  return builder;
}

const fromMock = supabase!.from as jest.Mock;

describe('refreshOverallBand — never invents an overall band from missing skills', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns null and records nothing when no skill has ever been scored (the onboarding-time case)', async () => {
    fromMock.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));
    const result = await refreshOverallBand('user-1');
    expect(result).toBeNull();
    // Only the read (getLatestBandScores) happened — no insert to record a
    // fabricated overall band.
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('returns null when three of the four skills are scored but one is still missing', async () => {
    fromMock.mockReturnValueOnce(
      makeQueryBuilder({
        data: [
          { skill: 'listening', band: '6.5' },
          { skill: 'reading', band: '6.0' },
          { skill: 'writing', band: '5.5' },
        ],
        error: null,
      })
    );
    const result = await refreshOverallBand('user-1');
    expect(result).toBeNull();
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('computes and records a real overall band once all four skills have a genuine score', async () => {
    const readBuilder = makeQueryBuilder({
      data: [
        { skill: 'listening', band: '6.5' },
        { skill: 'reading', band: '6.0' },
        { skill: 'writing', band: '5.5' },
        { skill: 'speaking', band: '6.0' },
      ],
      error: null,
    });
    const insertBuilder = makeQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValueOnce(readBuilder).mockReturnValueOnce(insertBuilder);

    const result = await refreshOverallBand('user-1');
    expect(result).toBe(6);
    expect(insertBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ skill: 'overall' }));
  });
});
