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
    .regex(/^[0-9]{13,19}$/, 'Enter 13–19 digit card number (digits only, no spaces or dashes)'),
  txnType: z.enum(['SALE', 'REFUND', 'VOID']).default('SALE'),
});
