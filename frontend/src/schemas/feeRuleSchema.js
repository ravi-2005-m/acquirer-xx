import { z } from 'zod';

const optNum = z.preprocess(
  v => (typeof v === 'number' && isNaN(v) ? undefined : v),
  z.number().min(0, 'Must be ≥ 0').optional()
);

export const feeRuleSchema = z.object({
  cardType:                z.string().min(1, 'Card type is required'),
  transactionType:         z.string().min(1, 'Transaction type is required'),
  schemePercentage:        z.number({ invalid_type_error: 'Required' }).min(0, 'Must be ≥ 0'),
  interchangePercentage:   z.number({ invalid_type_error: 'Required' }).min(0, 'Must be ≥ 0'),
  acquirerMarkupPercentage: z.number({ invalid_type_error: 'Required' }).min(0, 'Must be ≥ 0'),
  mccPattern:  z.string().max(10, 'Max 10 characters').optional(),
  region:      z.string().optional(),
  minAmount:   optNum,
  maxAmount:   optNum,
  network:     z.string().optional(),
  priority:    z.number({ invalid_type_error: 'Required' }).int().min(1, 'Min 1').max(999, 'Max 999'),
  effectiveFrom: z.string().optional(),
  effectiveTo:   z.string().optional(),
});
