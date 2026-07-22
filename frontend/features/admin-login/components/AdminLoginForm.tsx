'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAdminLogin } from '../hooks/useAdminLogin';

const fieldLabelClass = 'block text-sm font-medium text-foreground';
const fieldLabelStyle = { marginBottom: 6 };

export function AdminLoginForm() {
  const { register, onSubmit, errors, isSubmitting, formError } = useAdminLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-medium text-foreground">Admin Sign In</h1>
      <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
        Sign in with your administrator credentials
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col"
        style={{ gap: 16, marginTop: 24 }}
      >
        <div>
          <label htmlFor="admin-email" className={fieldLabelClass} style={fieldLabelStyle}>
            Email Address
          </label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your admin email"
            icon={<Mail className="h-4 w-4" />}
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <label htmlFor="admin-password" className={fieldLabelClass} style={fieldLabelStyle}>
            Password
          </label>
          <Input
            id="admin-password"
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
      </form>
    </div>
  );
}
