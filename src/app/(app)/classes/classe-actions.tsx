'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Classe } from '@/types';
import { DeleteClasseDialog } from './delete-classe-dialog';
import { EditClasseForm } from './edit-classe-form';

export function ClasseActions({ classe }: { classe: Classe }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <EditClasseForm classe={classe} />
        <DropdownMenuSeparator />
        <DeleteClasseDialog classeId={classe.id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
