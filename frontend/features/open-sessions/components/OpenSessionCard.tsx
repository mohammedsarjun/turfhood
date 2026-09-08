import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { OpenSessionDTO } from '@turfhood/shared';
import { Card, CardContent } from '@/components/ui';
import { formatTime12Hour } from '@/lib/time';

export function OpenSessionCard({ session }: { session: OpenSessionDTO }) {
  return (
    <Link href={`/open-sessions/${session.id}`}>
      <Card className="h-full overflow-hidden transition hover:border-primary">
        <div className="h-44 bg-muted">
          {session.courtImage ? <img src={session.courtImage} alt={session.courtName} className="h-full w-full object-cover" /> : null}
        </div>
        <CardContent className="space-y-3 py-4">
          <div><p className="text-sm font-medium text-primary">{session.sportName}</p><h2 className="text-lg font-semibold">{session.turfName} - {session.courtName}</h2></div>
          <p className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" />{new Date(`${session.bookingDate}T00:00:00`).toLocaleDateString('en-IN')} at {formatTime12Hour(session.startTime)}</p>
          <p className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />{session.joinedPlayers} joined · {session.maximumPlayers - session.joinedPlayers} spots left</p>
          <p className="flex items-center gap-2 truncate text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{session.address}</p>
          <p className="text-lg font-bold">₹{(session.pricePerParticipantPaise / 100).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">per player</span></p>
        </CardContent>
      </Card>
    </Link>
  );
}
