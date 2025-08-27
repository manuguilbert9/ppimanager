
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewNotesDialogProps {
  studentName: string;
  notes?: string;
  children: React.ReactNode;
}

export function ViewNotesDialog({ studentName, notes, children }: ViewNotesDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notes de suivi pour {studentName}</DialogTitle>
          <DialogDescription>
            Contenu des notes enregistrées pour cet élève.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
            {notes ? (
                <div className="whitespace-pre-wrap text-sm">{notes}</div>
            ) : (
                <p className="text-muted-foreground text-sm">Aucune note enregistrée pour cet élève.</p>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
