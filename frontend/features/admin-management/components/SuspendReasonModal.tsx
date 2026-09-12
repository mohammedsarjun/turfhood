'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, Textarea } from '@/components/ui';

export interface SuspendReasonModalProps {
  open: boolean;
  title: string;
  subjectName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export function SuspendReasonModal({
  open,
  title,
  subjectName,
  isSubmitting,
  onClose,
  onSubmit,
}: SuspendReasonModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Suspension reason is required.');
      return;
    }
    if (trimmed.length > 300) {
      setError('Suspension reason must be 300 characters or fewer.');
      return;
    }
    await onSubmit(trimmed);
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted-foreground" style={{ marginBottom: 12 }}>
        {subjectName}
      </p>
      <Textarea
        value={reason}
        onChange={(event) => {
          setReason(event.target.value);
          if (error) setError(null);
        }}
        placeholder="Enter suspension reason"
        rows={4}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end" style={{ gap: 8 }}>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" loading={isSubmitting} onClick={handleSubmit}>
          Suspend
        </Button>
      </div>
    </Modal>
  );
}
