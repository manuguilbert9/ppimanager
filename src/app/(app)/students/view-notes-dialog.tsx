
'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/rich-text-editor';

interface ViewNotesDialogProps {
  studentId: string;
  studentName: string;
  notes?: string;
  children: React.ReactNode;
  onSuccess: () => void;
}

export function ViewNotesDialog({ studentId, studentName, notes, children, onSuccess }: ViewNotesDialogProps) {
  const [open, setOpen] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStudent(studentId, { notes: editedNotes });
      toast({
        title: 'Notes enregistrées',
        description: `Les notes pour ${studentName} ont été mises à jour.`,
      });
      onSuccess(); // Refresh the data on the parent page
      setOpen(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement des notes.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Update local state if the parent `notes` prop changes
  React.useEffect(() => {
    setEditedNotes(notes || '');
  }, [notes]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notes de suivi pour {studentName}</DialogTitle>
          <DialogDescription>
            Consultez ou modifiez les notes enregistrées pour cet élève.
          </DialogDescription>
        </DialogHeader>
        <RichTextEditor
          value={editedNotes}
          onChange={setEditedNotes}
          className="min-h-[300px]"
          placeholder="Saisissez ici vos notes de suivi..."
        />
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
