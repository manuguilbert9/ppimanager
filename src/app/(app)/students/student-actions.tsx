
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
import type { Student, Classe } from '@/types';
import { DeleteStudentDialog } from './delete-student-dialog';
import { EditStudentForm } from './edit-student-form';
import { duplicatePpi } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ViewNotesDialog } from './view-notes-dialog';

export function StudentActions({ student, classes }: { student: Student, classes: Classe[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      await duplicatePpi(student.id);
      toast({
        title: 'Nouveau PPI créé',
        description: `Un nouveau brouillon de PPI a été créé pour ${student.firstName} ${student.lastName}.`,
      });
      router.refresh(); // Refresh the page to show the new student/PPI
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la duplication du PPI.',
      });
    } finally {
      setIsDuplicating(false);
    }
  };

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
         <ViewNotesDialog studentName={`${student.firstName} ${student.lastName}`} notes={student.notes} />
        {student.ppiStatus === 'archived' && (
          <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
            {isDuplicating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer un nouveau PPI"
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <EditStudentForm student={student} classes={classes} />
        <DeleteStudentDialog studentId={student.id} studentFirstName={student.firstName} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
