'use client';

import { useState } from 'react';
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

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

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
    setReason('');
    setError(null);
  };

  return (
    <Modal open={open} onClose={handleClose} title={title}>
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
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" loading={isSubmitting} onClick={handleSubmit}>
          Suspend
        </Button>
      </div>
    </Modal>
  );
}
