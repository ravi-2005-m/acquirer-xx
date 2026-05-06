import { z } from 'zod';

// Mirrors backend AuthorizeRequestDTO.panMasked regex exactly:
//   ^[0-9]{6}[*X]{3,9}[0-9]{4}$
// i.e. first 6 digits (BIN) + 3-9 mask chars (* or X) + last 4 digits.
// Total length 13–19. Example: 453201******0366
const PAN_MASKED_REGEX = /^[0-9]{6}[*X]{3,9}[0-9]{4}$/;

export const authorizeSchema = z.object({
  terminalId: z.number({ invalid_type_error: 'Terminal is required' })
    .int()
    .positive('Terminal is required'),
  amount: z.number({ invalid_type_error: 'Amount is required' })
    .positive('Amount must be positive')
    .max(1000000, 'Amount too large'),
  currency: z.string().length(3).default('INR'),
  panMasked: z.string()
    .regex(
      PAN_MASKED_REGEX,
      'Format: 6 digits + 3–9 of * or X + 4 digits (e.g. 453201******0366)'
    ),
  txnType: z.enum(['SALE', 'REFUND', 'VOID']).default('SALE'),
});
