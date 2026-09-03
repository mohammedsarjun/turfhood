import { usePathname } from '@/__mocks__/next/navigation';
import { render, screen } from '@/test/test-utils';
import { AdminSidebar } from '../AdminSidebar';

describe('AdminSidebar', () => {
  afterEach(() => {
    usePathname.mockReset();
  });

  it.each([
    ['/admin/dashboard', 'Dashboard'],
    ['/admin/sports', 'Sports'],
    ['/admin/amenities', 'Amenities'],
    ['/admin/commission', 'Commission'],
    ['/admin/refunds', 'Refunds'],
  ])('highlights %s as active for %s', (pathname, activeLabel) => {
    usePathname.mockReturnValue(pathname);
    render(<AdminSidebar />);

    const activeLink = screen.getByRole('link', { name: activeLabel });
    expect(activeLink.className).toContain('bg-sidebar-active');

    for (const label of ['Dashboard', 'Sports', 'Amenities', 'Commission', 'Refunds']) {
      if (label === activeLabel) continue;
      const link = screen.getByRole('link', { name: label });
      expect(link.className).not.toContain('bg-sidebar-active');
    }
  });
});
