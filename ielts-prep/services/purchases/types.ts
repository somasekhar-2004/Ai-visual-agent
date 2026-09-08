import type { SubscriptionPlan } from '@/types/models';

export type PurchaseProduct = {
  identifier: string;
  plan: SubscriptionPlan;
  title: string;
  description: string;
  priceString: string;
  period: 'monthly' | 'yearly';
  trialDays?: number;
};

export type PurchaseResult = { success: boolean; plan?: SubscriptionPlan; error?: string };

export interface PurchasesProvider {
  readonly name: string;
  getProducts(): Promise<PurchaseProduct[]>;
  purchase(productIdentifier: string): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
}
