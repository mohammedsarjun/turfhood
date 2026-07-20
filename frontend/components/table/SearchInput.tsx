import { Search } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui';

export type SearchInputProps = Omit<InputProps, 'icon'>;

/** Thin controlled wrapper around Input — debouncing lives in the consuming hook, not here. */
export function SearchInput(props: SearchInputProps) {
  return <Input type="search" icon={<Search className="h-4 w-4" />} {...props} />;
}
