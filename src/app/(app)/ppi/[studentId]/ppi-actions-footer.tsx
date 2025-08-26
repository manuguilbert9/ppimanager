
'use client';

import { useState } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PpiStatusChanger } from '../ppi-status-changer';
import type { Ppi } from '@/types';

interface PpiActionsFooterProps {
    onSubmit: () => Promise<boolean>;
    ppi: Ppi;
    onStatusChange: () => void;
}

export function PpiActionsFooter({ onSubmit, ppi, onStatusChange }: PpiActionsFooterProps) {
  const { control } = useFormContext();
  const { isDirty } = useFormState({ control });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    const success = await onSubmit();
    if (success) {
      setIsSaved(true);
       toast({
        title: 'Sauvegarde réussie',
        description: 'Toutes les modifications du PPI ont été enregistrées.',
      });
      setTimeout(() => setIsSaved(false), 2000);
    }
    setIsSaving(false);
  };

  const getButtonContent = () => {
    if (isSaving) {
      return <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</>;
    }
    if (isSaved) {
      return <><CheckCircle className="mr-2 h-4 w-4" /> Enregistré !</>;
    }
    return <><Save className="mr-2 h-4 w-4" /> Sauvegarder</>;
  };
  
  if (!isDirty && !isSaving && !isSaved) {
    return (
       <div className="fixed bottom-6 right-6 z-50">
        <PpiStatusChanger ppi={ppi} onStatusChanged={onStatusChange} as="button" />
      </div>
    )
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
       <PpiStatusChanger ppi={ppi} onStatusChanged={onStatusChange} as="button" />
       <Button
        type="button"
        size="lg"
        onClick={handleSave}
        disabled={isSaving || isSaved}
        className="shadow-lg"
      >
        {getButtonContent()}
      </Button>
    </div>
  );
}
