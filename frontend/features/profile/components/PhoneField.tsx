'use client';

import { useState } from 'react';
import { Pencil, Phone, Plus } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useUpdatePhone } from '../hooks/useUpdatePhone';
import type { PublicUser } from '../types';

interface PhoneFieldProps {
  profile: PublicUser;
  onUpdated: (user: PublicUser) => void;
}

export function PhoneField({ profile, onUpdated }: PhoneFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { register, onSubmit, errors, isSubmitting, formError, reset } = useUpdatePhone(
    profile.phone ?? '',
    (user) => {
      onUpdated(user);
      setIsEditing(false);
    },
  );

  if (!isEditing) {
    return (
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span className="text-sm font-medium text-foreground">Phone number</span>
        <div className="flex items-center justify-between">
          {profile.phone ? (
            <span className="text-sm text-foreground">{profile.phone}</span>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center text-sm text-primary hover:underline"
              style={{ gap: 4 }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add phone number
            </button>
          )}
          {profile.phone && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              aria-label="Edit phone number"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col" style={{ gap: 8 }}>
      <label htmlFor="profile-phone" className="text-sm font-medium text-foreground">
        Phone number
      </label>
      <div className="flex items-start" style={{ gap: 8 }}>
        <Input
          id="profile-phone"
          type="tel"
          icon={<Phone className="h-4 w-4" />}
          errorMessage={errors.phone?.message}
          autoFocus
          {...register('phone')}
        />
        <Button type="submit" loading={isSubmitting}>
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset({ phone: profile.phone ?? '' });
            setIsEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
      {formError && (
        <p role="alert" className="text-xs text-destructive">
          {formError}
        </p>
      )}
    </form>
  );
}
