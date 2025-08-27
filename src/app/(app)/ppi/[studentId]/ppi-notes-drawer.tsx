
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Notebook } from 'lucide-react';
import { NotesForm } from './notes-form';

export function PpiNotesDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        >
          <Notebook className="h-6 w-6" />
          <span className="sr-only">Ouvrir les notes</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle>Notes de suivi</SheetTitle>
          <SheetDescription>
            Espace pour consigner des observations, comptes-rendus, ou toute autre information. Les modifications sont enregistrées automatiquement.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 py-4 min-h-0">
          <NotesForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
