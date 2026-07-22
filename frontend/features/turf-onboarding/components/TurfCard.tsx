import { Image as ImageIcon } from 'lucide-react';
import { Badge, Card, CardContent } from '@/components/ui';
import { TURF_APPLICATION_STATUS_COPY } from '../lib/turfApplicationStatusCopy';
import type { TurfApplicationSummary } from '../types';

export interface TurfCardProps {
  application: TurfApplicationSummary;
  onClick: () => void;
}

/** Grid card summarizing one turf-owner application — click opens the full detail modal. */
export function TurfCard({ application, onClick }: TurfCardProps) {
  const images = application.images ?? [];
  const cover = images.find((image) => image.isCover) ?? images[0];
  const statusCopy = TURF_APPLICATION_STATUS_COPY[application.status];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick();
      }}
      className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="flex h-40 w-full items-center justify-center overflow-hidden bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- no next/image usage elsewhere in this repo
          <img src={cover.url} alt={application.name} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <CardContent style={{ paddingTop: 16 }}>
        <div className="flex items-center justify-between" style={{ gap: 8, marginBottom: 4 }}>
          <h3 className="truncate text-base font-medium text-foreground">{application.name}</h3>
          <Badge variant={statusCopy.badge}>{statusCopy.label}</Badge>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {application.address.city}, {application.address.state}
        </p>
      </CardContent>
    </Card>
  );
}
