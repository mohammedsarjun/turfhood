import { useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { useSportsForm } from '../hooks/useSportsForm';
import type { SportsType } from '../types';
import { IconPicker } from './IconPicker';
import { IconUpload } from './IconUpload';

export interface SportsFormModalProps {
  open: boolean;
  onClose: () => void;
  existing: SportsType | null;
  onSuccess: () => void;
}

export function SportsFormModal({ open, onClose, existing, onSuccess }: SportsFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Sport' : 'Add Sport'}>
      {/* Rendered strictly as Modal's child so it mounts fresh (and re-reads `existing`) every
          time the modal opens — Modal unmounts its children while closed. */}
      <SportsFormModalBody existing={existing} onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}

interface SportsFormModalBodyProps {
  existing: SportsType | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SportsFormModalBody({ existing, onClose, onSuccess }: SportsFormModalBodyProps) {
  const [iconItem, setIconItem] = useState(existing);
  const { register, onSubmit, errors, isSubmitting, formError, setIconFile } = useSportsForm(
    existing,
    () => {
      onSuccess();
      onClose();
    },
  );

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        {iconItem ? (
          <IconUpload
            sport={iconItem}
            onUpdated={(item) => {
              setIconItem(item);
              onSuccess();
            }}
          />
        ) : (
          <IconPicker onFileSelected={setIconFile} />
        )}
      </div>

      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="sport-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Name
          </label>
          <Input id="sport-name" errorMessage={errors.name?.message} {...register('name')} />
        </div>
        {formError && (
          <p role="alert" className="text-sm text-destructive" style={{ marginBottom: 16 }}>
            {formError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          {existing ? 'Save Changes' : 'Add Sport'}
        </Button>
      </form>
    </>
  );
}
