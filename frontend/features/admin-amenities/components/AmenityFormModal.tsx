import { useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { useAmenityForm } from '../hooks/useAmenityForm';
import type { Amenity } from '../types';
import { IconPicker } from './IconPicker';
import { IconUpload } from './IconUpload';

export interface AmenityFormModalProps {
  open: boolean;
  onClose: () => void;
  existing: Amenity | null;
  onSuccess: () => void;
}

export function AmenityFormModal({ open, onClose, existing, onSuccess }: AmenityFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Amenity' : 'Add Amenity'}>
      {/* Rendered strictly as Modal's child so it mounts fresh (and re-reads `existing`) every
          time the modal opens — Modal unmounts its children while closed. */}
      <AmenityFormModalBody existing={existing} onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}

interface AmenityFormModalBodyProps {
  existing: Amenity | null;
  onClose: () => void;
  onSuccess: () => void;
}

function AmenityFormModalBody({ existing, onClose, onSuccess }: AmenityFormModalBodyProps) {
  const [iconItem, setIconItem] = useState(existing);
  const { register, onSubmit, errors, isSubmitting, formError, setIconFile } = useAmenityForm(
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
            amenity={iconItem}
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
          <label htmlFor="amenity-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Name
          </label>
          <Input id="amenity-name" errorMessage={errors.name?.message} {...register('name')} />
        </div>
        {formError && (
          <p role="alert" className="text-sm text-destructive" style={{ marginBottom: 16 }}>
            {formError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          {existing ? 'Save Changes' : 'Add Amenity'}
        </Button>
      </form>
    </>
  );
}
