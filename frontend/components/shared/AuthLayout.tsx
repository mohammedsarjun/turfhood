import type { ReactNode } from 'react';

interface AuthLayoutProps {
  /** Left branded panel content (hidden on small screens). */
  panel: ReactNode;
  children: ReactNode;
}

/** Split-screen shell for auth pages: branded panel on the left, form on the right. */
export function AuthLayout({ panel, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="grid w-full min-w-0 max-w-5xl overflow-hidden rounded-2xl shadow-xl md:grid-cols-2 ml-2.5">
        <div className="hidden min-w-0 md:block">{panel}</div>
        <div className="flex min-w-0 items-center justify-center bg-card p-6 sm:p-12 ">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </main>
  );
}
