import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { UserSessionProvider } from '@/providers/UserSessionProvider';
import { ToastProvider } from '@/components/ui';

function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(
    <UserSessionProvider>
      <ToastProvider>{ui}</ToastProvider>
    </UserSessionProvider>,
    { ...options },
  );
}

export * from '@testing-library/react';
export { render };
