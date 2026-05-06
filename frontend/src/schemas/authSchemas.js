import { z } from 'zod';
import { passwordRule } from './common';

export const VALID_ROLES = ['ADMIN', 'MERCHANT_OPS', 'POS_OPS', 'RISK', 'DISPUTES', 'RECON'];

export const changeRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MERCHANT_OPS', 'POS_OPS', 'RISK', 'DISPUTES', 'RECON'], {
    errorMap: () => ({ message: 'Pick a valid role' }),
  }),
});

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  password: passwordRule,
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  name: z.string().max(100, 'Name cannot exceed 100 characters').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^$|^[+0-9 ()\-]{6,20}$/, 'Phone must be 6-20 digits')
    .optional()
    .or(z.literal('')),
  role: z.enum(['ADMIN', 'MERCHANT_OPS', 'POS_OPS', 'RISK', 'DISPUTES', 'RECON'], {
    errorMap: () => ({ message: 'Pick a valid role' }),
  }),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: passwordRule,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
