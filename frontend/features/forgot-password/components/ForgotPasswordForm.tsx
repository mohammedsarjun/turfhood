'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useForgotPassword } from '../hooks/useForgotPassword';

const fieldLabelClass = 'block text-sm font-medium text-foreground';
const fieldLabelStyle = { marginBottom: 6 };

export function ForgotPasswordForm() {
  const { register, onSubmit, errors, isSubmitting, formError, submitted } = useForgotPassword();

  if (submitted) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-foreground">Check your email</h1>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
          If an account exists for that email, we&apos;ve sent a link to reset your password. The
          link expires in 30 minutes.
        </p>
        <p className="text-center text-sm text-muted-foreground" style={{ marginTop: 24 }}>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to Log In
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-medium text-foreground">Forgot Password</h1>
      <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
        Enter the email address linked to your Turfhood account and we&apos;ll send you a password
        reset link.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col"
        style={{ gap: 16, marginTop: 24 }}
      >
        <div>
          <label htmlFor="email" className={fieldLabelClass} style={fieldLabelStyle}>
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            icon={<Mail className="h-4 w-4" />}
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 text-sm text-destructive"
            style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }}
          >
            {formError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Send Reset Link
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remembered your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
