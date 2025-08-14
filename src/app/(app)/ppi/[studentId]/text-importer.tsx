
'use client';

import { useState } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { extractDataFromText, type ExtractedData } from '@/ai/flows/extract-text-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TextImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ExtractedData) => void;
}

export function TextImporter({ open, onOpenChange, onImport }: TextImporterProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
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
    setExtractedData(null);
    try {
      const data = await extractDataFromText(text);
      setExtractedData(data);
      setShowResultDialog(true);
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

  const handleConfirmImport = () => {
    if (extractedData) {
      onImport(extractedData);
      toast({
        title: 'Importation confirmée',
        description: 'Les informations ont été pré-remplies dans le PPI.',
      });
    }
    setShowResultDialog(false);
    onOpenChange(false);
  };

  const handleCancelImport = () => {
    setShowResultDialog(false);
    setExtractedData(null);
  }

  return (
    <>
      <Dialog open={open && !showResultDialog} onOpenChange={onOpenChange}>
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
                'Analyser le texte'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Données extraites par l'IA</AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez vérifier les données extraites ci-dessous. Cliquez sur "Confirmer" pour les importer dans le PPI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="h-[50vh] rounded-md border p-4 bg-secondary/50">
            <pre className="text-sm">
              {JSON.stringify(extractedData, null, 2)}
            </pre>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelImport}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              Confirmer et Importer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
