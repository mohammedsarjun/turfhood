'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useSignUp } from '../hooks/useSignUp';

const PASSWORD_RULES = [
  { label: '8+ characters', test: (value: string) => value.length >= 8 },
  { label: 'Number', test: (value: string) => /[0-9]/.test(value) },
  { label: 'Uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Symbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

const fieldLabelClass = 'block text-xs font-medium uppercase tracking-wide text-muted-foreground';
const fieldLabelStyle = { marginBottom: 6 };

export function SignUpForm() {
  const { register, onSubmit, errors, isSubmitting, formError, watch } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = watch('password');

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <h1 className="text-2xl font-medium text-secondary">Get Started</h1>
      <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
        Create your account to start booking professional turfs in your hood.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col"
        style={{ marginTop: 24, gap: 16 }}
      >
        <div>
          <label htmlFor="name" className={fieldLabelClass} style={fieldLabelStyle}>
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Marcus Rashford"
            icon={<User className="h-4 w-4" />}
            errorMessage={errors.name?.message}
            {...register('name')}
          />
        </div>

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

        <div>
          <label htmlFor="phone" className={fieldLabelClass} style={fieldLabelStyle}>
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="1245674547"
            icon={<Phone className="h-4 w-4" />}
            errorMessage={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div>
          <label htmlFor="password" className={fieldLabelClass} style={fieldLabelStyle}>
            Create Password
          </label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
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

          <ul
            className="flex flex-wrap"
            style={{ marginTop: 8, columnGap: 16, rowGap: 4 }}
          >
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(passwordValue ?? '');
              return (
                <li
                  key={rule.label}
                  className={`flex items-center text-xs ${met ? 'text-primary' : 'text-muted-foreground'}`}
                  style={{ gap: 4 }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <label className="flex items-start text-sm text-muted-foreground" style={{ gap: 8 }}>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ marginTop: 2 }}
              {...register('agreeToTerms')}
            />
            <span>
              By creating an account, I agree to the <span className="text-primary">Terms of Service</span> and{' '}
              <span className="text-primary">Privacy Policy</span>.
            </span>
          </label>
          {errors.agreeToTerms && (
            <p role="alert" className="text-xs text-destructive" style={{ marginTop: 6 }}>
              {errors.agreeToTerms.message}
            </p>
          )}
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
          Create My Account →
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already a member?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log In to TurfHood
          </Link>
        </p>
      </form>
    </div>
  );
}
