// Regression coverage for the Bandpath recovery handover's item 5
// ("Writing/Speaking AI reliability"). generateOperationId() was reconciled
// against the live, deployed backend (api.supabase.com, read-only token,
// 2026-11-06): the real Edge Functions validate this field with Zod's
// `z.string().uuid()` (supabase/functions/_shared/schemas.ts), which — per
// an earlier, real zod@4.5.4 check run in this session — rejects a
// UUID-shaped string with the wrong version/variant nibble, not just
// anything matching the general xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx shape.
import { generateOperationId } from '@/lib/operationId';

describe('generateOperationId', () => {
  const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  it('returns a real RFC 4122 v4 UUID — not just a UUID-shaped string', () => {
    const id = generateOperationId();
    expect(id).toMatch(UUID_V4_RE);
  });

  it('is not deterministic — two calls never return the same id (each is a genuinely new logical attempt)', () => {
    const a = generateOperationId();
    const b = generateOperationId();
    expect(a).not.toBe(b);
  });

  it('every id in a large sample is valid and unique (no format drift, no accidental collision)', () => {
    const ids = Array.from({ length: 200 }, () => generateOperationId());
    expect(ids.every((id) => UUID_V4_RE.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
