// Manual mock for next/navigation. Because this file lives in a __mocks__
// folder adjacent to node_modules, Jest applies it automatically to every
// test that imports next/navigation — no jest.mock() call needed anywhere.
//
// `push`/`replace` are exported so tests can assert on redirects, e.g.:
//   import { push } from '@/__mocks__/next/navigation';
//   expect(push).toHaveBeenCalledWith('/login');
export const push = jest.fn();
export const replace = jest.fn();
export const refresh = jest.fn();

export function useRouter() {
  return { push, replace, refresh };
}

// Tests set a return value with `usePathname.mockReturnValue('/admin/sports')`.
export const usePathname = jest.fn(() => '/');
