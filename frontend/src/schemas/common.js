import { z } from 'zod';

export const requiredString = (label) =>
  z.string().min(1, `${label} is required`).trim();

export const optionalString = z.string().trim().optional();

export const mccRule = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\d{4}$/.test(v), { message: 'MCC must be exactly 4 digits' })
  .optional();

export const emailRule = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const passwordRule = z.string().min(6, 'Password must be at least 6 characters');
