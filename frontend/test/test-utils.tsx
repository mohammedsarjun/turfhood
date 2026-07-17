import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, { ...options });
}

export * from '@testing-library/react';
export { render };
