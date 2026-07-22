import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/test-utils';
import { ToastProvider } from '@/components/ui';
import { TurfApplicationStatus } from '@turfhood/shared';
import {
  approveTurfOwnerApplication,
  rejectTurfOwnerApplication,
} from '../../actions/turfApplicationsAdminApi';
import { ApplicationReviewModal } from '../ApplicationReviewModal';
import type { TurfApplicationSummary } from '@turfhood/shared';
import type { ReactElement } from 'react';

function renderWithToast(ui: ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

jest.mock('../../actions/turfApplicationsAdminApi');
const approveMock = jest.mocked(approveTurfOwnerApplication);
const rejectMock = jest.mocked(rejectTurfOwnerApplication);

const pendingApplication: TurfApplicationSummary = {
  id: 'application_1',
  name: 'Green Turf Arena',
  address: {
    line1: '1 Main St',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600002',
  },
  location: { type: 'Point', coordinates: [80.27, 13.08] },
  sportsOffered: [],
  amenities: [],
  documents: [],
  images: [],
  status: TurfApplicationStatus.PENDING,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ApplicationReviewModal', () => {
  beforeEach(() => {
    approveMock.mockReset();
    rejectMock.mockReset();
  });

  it('does not show the rejection reason field until Reject is clicked', () => {
    renderWithToast(
      <ApplicationReviewModal application={pendingApplication} onClose={jest.fn()} onSuccess={jest.fn()} />,
    );

    expect(screen.queryByLabelText(/rejection reason/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^approve$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^reject$/i })).toBeInTheDocument();
  });

  it('approving does not require or send a rejection reason', async () => {
    approveMock.mockResolvedValueOnce({ application: { ...pendingApplication, status: TurfApplicationStatus.APPROVED } });
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithToast(
      <ApplicationReviewModal application={pendingApplication} onClose={jest.fn()} onSuccess={onSuccess} />,
    );

    await user.click(screen.getByRole('button', { name: /^approve$/i }));

    expect(approveMock).toHaveBeenCalledWith('application_1');
    expect(rejectMock).not.toHaveBeenCalled();
  });

  it('reveals the reason field only after clicking Reject, then submits it on confirm', async () => {
    rejectMock.mockResolvedValueOnce({ application: { ...pendingApplication, status: TurfApplicationStatus.REJECTED } });
    const user = userEvent.setup();

    renderWithToast(
      <ApplicationReviewModal application={pendingApplication} onClose={jest.fn()} onSuccess={jest.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /^reject$/i }));

    const reasonField = await screen.findByLabelText(/rejection reason/i);
    await user.type(reasonField, 'Documents were unclear.');
    await user.click(screen.getByRole('button', { name: /confirm rejection/i }));

    expect(rejectMock).toHaveBeenCalledWith('application_1', 'Documents were unclear.');
  });

  it('shows the stored rejection reason for an already-rejected application', () => {
    renderWithToast(
      <ApplicationReviewModal
        application={{
          ...pendingApplication,
          status: TurfApplicationStatus.REJECTED,
          reviewNotes: 'Documents were unclear.',
        }}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />,
    );

    expect(screen.getByText(/documents were unclear/i)).toBeInTheDocument();
  });
});
