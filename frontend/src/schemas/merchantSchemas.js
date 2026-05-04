import { z } from 'zod';
import { requiredString, mccRule } from './common';

export const merchantCreateSchema = z.object({
  legalName: requiredString('Legal name').max(150, 'Legal name cannot exceed 150 characters'),
  doingBusinessAs: z.string().trim().max(150, 'DBA cannot exceed 150 characters').optional().or(z.literal('')),
  mcc: mccRule,
  contactInfo: requiredString('Contact info').max(500, 'Contact info cannot exceed 500 characters'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
});
