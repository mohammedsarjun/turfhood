import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

const bankAccountSchema = z.object({
  accountHolderName: z.string().trim().min(2, 'Account holder name is required.').max(100),
  bankName: z.string().trim().min(2, 'Bank name is required.').max(100),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, 'Account number must be 9 to 18 digits.'),
  ifscCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, 'Enter a valid IFSC code.'),
  accountType: z.enum(['savings', 'current']),
});

const withdrawalSchema = z.object({
  amountPaise: z.number().int().min(100, 'Withdrawal amount must be at least INR 1.'),
  bankAccountId: z.string().trim().min(1, 'Choose a bank account.'),
});

const rejectionSchema = z.object({
  reason: z.string().trim().min(5, 'Rejection reason must be at least 5 characters.').max(300),
});

export type ValidatedBankAccountRequest = Request & {
  validatedBankAccount?: z.infer<typeof bankAccountSchema>;
};
export type ValidatedWithdrawalRequest = Request & {
  validatedWithdrawal?: z.infer<typeof withdrawalSchema>;
};
export type ValidatedWithdrawalRejectionRequest = Request & {
  validatedRejection?: z.infer<typeof rejectionSchema>;
};

const sendErrors = (res: Response, error: z.ZodError) => {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues)
    errors[issue.path.at(-1)?.toString() ?? 'form'] = [issue.message];
  res
    .status(HttpStatus.BAD_REQUEST)
    .json({ message: 'Please correct the highlighted fields.', errors });
};

export function validateBankAccount(req: Request, res: Response, next: NextFunction) {
  const result = bankAccountSchema.safeParse(req.body);
  if (!result.success) {
    sendErrors(res, result.error);
    return;
  }
  (req as ValidatedBankAccountRequest).validatedBankAccount = result.data;
  next();
}

export function validateWithdrawal(req: Request, res: Response, next: NextFunction) {
  const result = withdrawalSchema.safeParse(req.body);
  if (!result.success) {
    sendErrors(res, result.error);
    return;
  }
  (req as ValidatedWithdrawalRequest).validatedWithdrawal = result.data;
  next();
}

export function validateWithdrawalRejection(req: Request, res: Response, next: NextFunction) {
  const result = rejectionSchema.safeParse(req.body);
  if (!result.success) {
    sendErrors(res, result.error);
    return;
  }
  (req as ValidatedWithdrawalRejectionRequest).validatedRejection = result.data;
  next();
}
