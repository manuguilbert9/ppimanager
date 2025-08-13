
'use client';

import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { extractDataFromText, type ExtractedData } from '@/ai/flows/extract-text-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TextImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ExtractedData) => void;
}

export function TextImporter({ open, onOpenChange, onImport }: TextImporterProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Aucun texte fourni',
        description: 'Veuillez coller le texte à analyser.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const extractedData = await extractDataFromText(text);
      onImport(extractedData);
      toast({
        title: 'Importation réussie',
        description: 'Les informations ont été extraites et pré-remplies dans le PPI.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'analyse",
        description: "L'IA n'a pas pu traiter le texte fourni. Vérifiez le format et réessayez.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importer les données depuis un texte</DialogTitle>
          <DialogDescription>
            Collez le texte brut de votre document (ex: export de GevaSco) ci-dessous.
            L'IA l'analysera pour pré-remplir automatiquement les champs du PPI.
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Comment ça marche ?</AlertTitle>
          <AlertDescription>
            Utilisez un GPT externe pour extraire le texte d'un PDF (comme un GevaSco), puis collez le résultat ici. L'application se chargera de tout mettre en forme.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Collez ici le texte à analyser..."
            className="min-h-[300px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              'Analyser et Importer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
