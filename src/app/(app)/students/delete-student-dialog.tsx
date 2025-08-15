
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { deleteStudent } from '@/lib/students-repository';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DeleteStudentDialog({ studentId, studentFirstName }: { studentId: string; studentFirstName: string; }) {
  const [open, setOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const isConfirmationValid = confirmationName === studentFirstName;

  const handleDelete = async () => {
    if (!isConfirmationValid) {
        toast({
            variant: 'destructive',
            title: "Confirmation invalide",
            description: "Le prénom saisi ne correspond pas.",
        });
        return;
    }
    
    try {
      await deleteStudent(studentId);
      toast({
        title: 'Élève supprimé',
        description: "L'élève a été supprimé avec succès.",
      });
      router.refresh();
      setOpen(false);
      setConfirmationName('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erreur lors de la suppression",
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if(!isOpen) setConfirmationName(''); }}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive"
        >
          Supprimer
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Cela supprimera définitivement
            l'élève et toutes les données associées. Pour confirmer, veuillez taper
            <span className="font-bold text-foreground"> {studentFirstName} </span>
            dans le champ ci-dessous.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
            <Label htmlFor="confirmation" className="sr-only">Prénom de l'élève</Label>
            <Input 
                id="confirmation"
                value={confirmationName}
                onChange={(e) => setConfirmationName(e.target.value)}
                placeholder={`Tapez "${studentFirstName}" pour confirmer`}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={!isConfirmationValid}
            className="bg-destructive hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
