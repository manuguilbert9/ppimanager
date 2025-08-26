
'use client';

import { useState } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavePpiButtonProps {
    onSubmit: () => Promise<boolean>;
}

export function SavePpiButton({ onSubmit }: SavePpiButtonProps) {
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
    return null;
  }

  return (
    <Button
      type="button"
      onClick={handleSave}
      disabled={isSaving || isSaved}
    >
      {getButtonContent()}
    </Button>
  );
}
