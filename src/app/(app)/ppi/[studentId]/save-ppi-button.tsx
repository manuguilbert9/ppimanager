
'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isEqual } from 'lodash';

interface SavePpiButtonProps {
    onSubmit: () => Promise<boolean>;
    isFloating?: boolean;
}

export function SavePpiButton({ onSubmit, isFloating = false }: SavePpiButtonProps) {
  const { control } = useFormContext();
  const { defaultValues } = useFormState({ control });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  
  const [isActuallyDirty, setIsActuallyDirty] = useState(false);
  
  // Watch all form values
  const currentValues = useWatch({ control });
  
  useEffect(() => {
    if (!defaultValues) return;

    // Check deep equality to see if anything has changed.
    const hasChanged = !isEqual(currentValues, defaultValues);
    setIsActuallyDirty(hasChanged);
  }, [currentValues, defaultValues]);
  
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

  if (!isActuallyDirty && !isSaving && !isSaved) {
    return null;
  }

  if (isFloating) {
      return (
         <div className="fixed bottom-24 right-6 z-50 animate-in fade-in-50 slide-in-from-bottom-10 duration-300">
             <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isSaved}
                size="lg"
                className="shadow-lg"
                >
                {getButtonContent()}
            </Button>
         </div>
      )
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
