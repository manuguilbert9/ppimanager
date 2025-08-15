
'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SortDirection = 'asc' | 'desc';

interface SortableHeaderProps<T> {
  label: string;
  sortKey: T;
  currentSort: { key: T; direction: SortDirection };
  onSort: (key: T) => void;
}

export function SortableHeader<T>({
  label,
  sortKey,
  currentSort,
  onSort,
}: SortableHeaderProps<T>) {
  const isActive = currentSort.key === sortKey;
  
  const getIcon = () => {
    if (!isActive) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
    }
    return currentSort.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <Button variant="ghost" onClick={() => onSort(sortKey)} className="-ml-4 h-auto p-2 group">
      {label}
      {getIcon()}
    </Button>
  );
}
