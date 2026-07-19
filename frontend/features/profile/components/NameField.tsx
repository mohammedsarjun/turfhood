'use client';

import { useState } from 'react';
import { Pencil, User } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useUpdateName } from '../hooks/useUpdateName';
import type { PublicUser } from '../types';

interface NameFieldProps {
  profile: PublicUser;
  onUpdated: (user: PublicUser) => void;
}

export function NameField({ profile, onUpdated }: NameFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { register, onSubmit, errors, isSubmitting, formError, reset } = useUpdateName(
    profile.name,
    (user) => {
      onUpdated(user);
      setIsEditing(false);
    },
  );

  if (!isEditing) {
    return (
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span className="text-sm font-medium text-foreground">Name</span>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">{profile.name}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            aria-label="Edit name"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col"
      style={{ gap: 8 }}
    >
      <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
        Name
      </label>
      <div className="flex items-start" style={{ gap: 8 }}>
        <Input
          id="profile-name"
          icon={<User className="h-4 w-4" />}
          errorMessage={errors.name?.message}
          autoFocus
          {...register('name')}
        />
        <Button type="submit" loading={isSubmitting}>
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset({ name: profile.name });
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
