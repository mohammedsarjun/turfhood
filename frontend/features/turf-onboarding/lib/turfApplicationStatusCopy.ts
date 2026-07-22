import type { TurfApplicationSummary } from '../types';

export const TURF_APPLICATION_STATUS_COPY: Record<
  TurfApplicationSummary['status'],
  { badge: 'success' | 'warning' | 'destructive'; label: string; message: string }
> = {
  pending: {
    badge: 'warning',
    label: 'Pending review',
    message:
      'An admin is reviewing your application and documents. This usually takes a few business days.',
  },
  approved: {
    badge: 'success',
    label: 'Approved',
    message: 'Your application has been approved and your turf is live on Turfhood.',
  },
  rejected: {
    badge: 'destructive',
    label: 'Rejected',
    message: 'Your application was not approved.',
  },
};
