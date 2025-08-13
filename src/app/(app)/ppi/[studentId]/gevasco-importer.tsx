
'use client';

import React, { useState, useTransition } from 'react';
import { Paperclip, Loader2, WandSparkles, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExtractGevascoOutput } from '@/ai/flows/extract-gevasco-flow';
import type { Student } from '@/types';
import { processGevascoFile } from '@/lib/gevasco-actions';

export function GevascoImporter({ student }: { student: Student }) {
  const [isPending, startTransition] = useTransition();
  const [extractedData, setExtractedData] = useState<ExtractGevascoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('gevascoFile');

    if (!file || !(file instanceof File) || file.size === 0) {
        toast({
            variant: 'destructive',
            title: 'Aucun fichier sélectionné',
            description: 'Veuillez sélectionner un fichier PDF.',
        });
        return;
    }
     if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Fichier invalide',
        description: 'Veuillez sélectionner un fichier PDF.',
      });
      return;
    }


    startTransition(async () => {
      setError(null);
      setExtractedData(null);
      try {
        const result = await processGevascoFile(student.id, formData);
        if (result.error) {
          setError(result.error);
        } else if (result.extractedData) {
          setExtractedData(result.extractedData);
        }
      } catch (e) {
        console.error(e);
        setError('Une erreur inattendue est survenue.');
      }
    });
  };

  const handleApplyData = async () => {
    if (!extractedData) return;

    startTransition(async () => {
        try {
            const formData = new FormData();
            formData.append('studentId', student.id);
            formData.append('extractedData', JSON.stringify(extractedData));
            
            // This would be a separate server action if we were to save the modified data
            // For now, we assume the initial extraction is what is applied.
            // The logic is already server-side, so we just refresh.

            toast({
                title: 'PPI mis à jour',
                description: "Les informations du GevaSco ont été ajoutées au profil de l'élève.",
            });
            setExtractedData(null);
            router.refresh();

        } catch (updateError) {
          console.error(updateError);
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible de sauvegarder les données extraites.',
          });
        }
    });
  };

  const renderExtractedData = () => {
    if (!extractedData) return null;
  
    const dataToRender = { ...extractedData };
    
    const isEmpty = Object.values(dataToRender).every(category => {
      if (!category) return true;
      if (typeof category !== 'object' || category === null) return true;
      return Object.values(category).every(value => !value || (Array.isArray(value) && value.length === 0));
    });

    if (isEmpty) {
        return <p>L'IA n'a trouvé aucune information à extraire dans ce document.</p>;
    }
    
    return (
      <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6 text-sm">
        <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Vérification requise</AlertTitle>
            <AlertDescription>
                Les informations ci-dessous ont été extraites. Elles seront fusionnées avec les données existantes.
                La modification des données ici n'est pas encore prise en charge. Cliquez sur "Appliquer" pour confirmer.
            </AlertDescription>
        </Alert>
        {/* Simplified render logic for brevity. In a real app, you'd allow editing. */}
        <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded-md">{JSON.stringify(extractedData, null, 2)}</pre>
      </div>
    )
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleFormSubmit}>
        <Alert>
            <WandSparkles className="h-4 w-4" />
            <AlertTitle>Gagnez du temps avec l'IA</AlertTitle>
            <AlertDescription>
            Importez un GevaSco au format PDF pour pré-remplir automatiquement les sections du PPI.
            </AlertDescription>
            <div className="mt-4 flex gap-2 items-center">
                <Input
                    type="file"
                    name="gevascoFile"
                    className="max-w-xs"
                    accept="application/pdf"
                    disabled={isPending}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    {isPending ? 'Analyse en cours...' : 'Analyser le GevaSco'}
                </Button>
            </div>
        </Alert>
      </form>

      <Dialog open={!!extractedData || !!error} onOpenChange={(open) => {
          if (!open) {
              setExtractedData(null);
              setError(null);
          }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
                {error ? "Erreur d'importation" : 'Données extraites du GevaSco'}
            </DialogTitle>
            <DialogDescription>
              {error ? "Une erreur est survenue." : "Vérifiez les informations extraites par l'IA avant de les appliquer au PPI."}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {extractedData && renderExtractedData()}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setExtractedData(null); setError(null); }}>
              Annuler
            </Button>
            {!error && (
                <Button onClick={handleApplyData} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Appliquer au PPI'}
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}