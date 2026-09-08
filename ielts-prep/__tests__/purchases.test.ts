import { MockPurchasesProvider } from '@/services/purchases/mockProvider';

describe('MockPurchasesProvider', () => {
  const provider = new MockPurchasesProvider();

  it('returns monthly and yearly products without hardcoding them in UI', async () => {
    const products = await provider.getProducts();
    expect(products.length).toBe(2);
    expect(products.map((p) => p.period).sort()).toEqual(['monthly', 'yearly']);
  });

  it('purchase() succeeds for a known product and maps to the right plan', async () => {
    const result = await provider.purchase('premium_yearly');
    expect(result.success).toBe(true);
    expect(result.plan).toBe('premium_yearly');
  });

  it('purchase() fails gracefully for an unknown product', async () => {
    const result = await provider.purchase('does-not-exist');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('restore() reports no purchase found in demo mode', async () => {
    const result = await provider.restore();
    expect(result.success).toBe(false);
  });
});
