'use client';

interface ResendControlProps {
  secondsLeft: number;
  isExpired: boolean;
  onResend: () => void;
}

export function ResendControl({ secondsLeft, isExpired, onResend }: ResendControlProps) {
  if (!isExpired) {
    const urgent = secondsLeft <= 10;
    return (
      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code? Resend in{' '}
        <span
          className={
            urgent
              ? 'font-medium tabular-nums text-warning-foreground'
              : 'font-medium tabular-nums text-primary'
          }
        >
          0:{String(secondsLeft).padStart(2, '0')}
        </span>
      </p>
    );
  }

  return (
    <p className="text-center text-sm text-muted-foreground">
      Didn&apos;t receive the code?{' '}
      <button type="button" onClick={onResend} className="font-medium text-primary hover:underline">
        Resend Code
      </button>
    </p>
  );
}
