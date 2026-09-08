import { Crown, UserRound, UsersRound } from 'lucide-react';
import type { OpenSessionParticipantDTO } from '@turfhood/shared';
import { Badge } from '@/components/ui';

interface SessionParticipantsProps {
  participants: OpenSessionParticipantDTO[];
  currentUserId?: string;
  maximumPlayers: number;
}

export function SessionParticipants({
  participants,
  currentUserId,
  maximumPlayers,
}: SessionParticipantsProps) {
  const paidParticipants = participants.filter(
    (participant) => participant.paymentStatus === 'paid',
  );

  return (
    <section aria-labelledby="participants-heading">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UsersRound className="h-4 w-4" />
        </span>
        <div>
          <h2 id="participants-heading" className="font-semibold">
            Participants
          </h2>
          <p className="text-xs text-muted-foreground">
            {paidParticipants.length} of {maximumPlayers} spots filled
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {paidParticipants.map((participant) => {
          const isCurrentUser = participant.userId === currentUserId;
          const initial = participant.name.trim().charAt(0).toUpperCase() || '?';
          return (
            <div
              key={participant.userId}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${isCurrentUser ? 'border-primary bg-primary/10 ring-1 ring-primary/20' : 'border-border bg-background/60'}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                aria-hidden="true"
              >
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{participant.name}</p>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  {participant.isCreator ? (
                    <>
                      <Crown className="h-3 w-3 text-amber-500" /> Session host
                    </>
                  ) : (
                    <>
                      <UserRound className="h-3 w-3" /> Player
                    </>
                  )}
                </div>
              </div>
              {isCurrentUser && <Badge>You</Badge>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
