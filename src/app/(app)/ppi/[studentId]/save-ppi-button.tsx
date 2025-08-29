
'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface SavePpiButtonProps {
  isDirty: boolean;
  isSubmitting: boolean;
}

export function SavePpiButton({ isDirty, isSubmitting }: SavePpiButtonProps) {
  if (!isDirty) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-24 z-50">
       <Button
            type="submit"
            size="lg"
            className="shadow-lg"
            disabled={isSubmitting}
        >
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                </>
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                </>
            )}
       </Button>
    </div>
  );
}
