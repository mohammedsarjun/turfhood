import { useState } from 'react';
import { Badge, Button, Modal, Text, Textarea } from '@/components/ui';
import { TurfImageGallery } from '@/components/shared';
import type { TurfApplicationSummary } from '@turfhood/shared';
import { useReviewApplication } from '../hooks/useReviewApplication';

export interface ApplicationReviewModalProps {
  application: TurfApplicationSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationReviewModal({
  application,
  onClose,
  onSuccess,
}: ApplicationReviewModalProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const { approve, reject, isSubmitting, error } = useReviewApplication(() => {
    onSuccess();
    handleClose();
  });

  function handleClose() {
    setReviewNotes('');
    setIsRejecting(false);
    onClose();
  }

  if (!application) return null;

  const isPending = application.status === 'pending';

  return (
    <Modal
      open={Boolean(application)}
      onClose={handleClose}
      title={application.name}
      className="max-w-2xl"
    >
      <div className="flex flex-col" style={{ gap: 12 }}>
        <TurfImageGallery images={application.images ?? []} altText={application.name} />
        <div>
          <Text as="span" className="font-medium text-foreground">
            Status:{' '}
          </Text>
          <Badge
            variant={
              application.status === 'approved'
                ? 'success'
                : application.status === 'rejected'
                  ? 'destructive'
                  : 'warning'
            }
          >
            {application.status}
          </Badge>
        </div>
        {application.description && <Text>{application.description}</Text>}
        <Text>
          {application.address.line1}, {application.address.city}, {application.address.state},{' '}
          {application.address.country} - {application.address.pincode}
        </Text>
        <Text>
          Coordinates: {application.location.coordinates[1]}, {application.location.coordinates[0]}
        </Text>
        <div>
          <Text as="span" className="font-medium text-foreground">
            Documents
          </Text>
          <ul className="list-disc" style={{ paddingLeft: 20, marginTop: 4 }}>
            {application.documents.map((doc, index) => (
              <li key={`${doc.url}-${index}`}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  {doc.type}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {application.status === 'rejected' && application.reviewNotes && (
          <Text>
            <strong>Rejection reason:</strong> {application.reviewNotes}
          </Text>
        )}

        {isPending && (
          <>
            {isRejecting && (
              <div>
                <label
                  htmlFor="rejection-reason"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Rejection reason (optional)
                </label>
                <Textarea
                  id="rejection-reason"
                  autoFocus
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                />
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex items-center justify-end" style={{ gap: 8 }}>
              {isRejecting ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => {
                      setIsRejecting(false);
                      setReviewNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    loading={isSubmitting}
                    onClick={() => void reject(application.id, reviewNotes || undefined)}
                  >
                    Confirm Rejection
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={() => setIsRejecting(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    loading={isSubmitting}
                    onClick={() => void approve(application.id)}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
