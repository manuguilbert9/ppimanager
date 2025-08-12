'use client';

import Link from 'next/link';
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
import type { Student } from '@/types';
import { DeleteStudentDialog } from './delete-student-dialog';
import { EditStudentForm } from './edit-student-form';

export function StudentActions({ student }: { student: Student }) {
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
        <DropdownMenuItem asChild>
          <Link href={`/ppi/${student.id}`}>Voir le PPI</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <EditStudentForm student={student} />
        <DeleteStudentDialog studentId={student.id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
