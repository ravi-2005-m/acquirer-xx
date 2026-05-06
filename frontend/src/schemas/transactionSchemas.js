import { z } from 'zod';

export const authorizeSchema = z.object({
  terminalId: z.number({ invalid_type_error: 'Terminal is required' })
    .int()
    .positive('Terminal is required'),
  amount: z.number({ invalid_type_error: 'Amount is required' })
    .positive('Amount must be positive')
    .max(1000000, 'Amount too large'),
  currency: z.string().length(3).default('INR'),
  panMasked: z.string()
    .min(13, 'PAN must be at least 13 characters')
    .max(20, 'PAN too long')
    .regex(/^[\d*X]+$/, 'PAN must contain only digits, * or X'),
  txnType: z.enum(['SALE', 'REFUND', 'VOID']).default('SALE'),
});
