'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { GoogleAuthSection, useGoogleAuth } from '@/features/google-auth';
import { useLogin } from '../hooks/useLogin';

interface LoginFormProps {
  signupSuccess?: boolean;
}

const fieldLabelClass = 'block text-sm font-medium text-foreground';
const fieldLabelStyle = { marginBottom: 6 };

export function LoginForm({ signupSuccess }: LoginFormProps) {
  const { register, onSubmit, errors, isSubmitting, formError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const googleAuth = useGoogleAuth();

  return (
    <div>
      <h1 className="text-2xl font-medium text-foreground">Welcome back</h1>
      <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
        Please enter your credentials to access your account
      </p>

      {signupSuccess && (
        <p
          role="status"
          className="rounded-md bg-primary/10 text-sm text-primary"
          style={{
            marginTop: 16,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          Account created successfully — please log in.
        </p>
      )}

      <GoogleAuthSection
        onClick={() => googleAuth.trigger()}
        loading={googleAuth.isLoading}
        error={googleAuth.error}
      />

      <form onSubmit={onSubmit} noValidate className="flex flex-col" style={{ gap: 16 }}>
        <div>
          <label htmlFor="email" className={fieldLabelClass} style={fieldLabelStyle}>
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            icon={<Mail className="h-4 w-4" />}
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <label htmlFor="password" className={fieldLabelClass} style={fieldLabelStyle}>
            Password
          </label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<Lock className="h-4 w-4" />}
            errorMessage={errors.password?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('password')}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-muted-foreground" style={{ gap: 8 }}>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Forgot password?
          </Link>
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

        <Button type="submit" loading={isSubmitting} className="w-full" style={{ marginTop: 8 }}>
          Sign In
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up for free
          </Link>
        </p>
      </form>
    </div>
  );
}
