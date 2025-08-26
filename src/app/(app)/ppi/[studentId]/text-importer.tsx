
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, ExternalLink } from 'lucide-react';

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
import type { ExtractedData } from '@/types/schemas';
import { extractDataFromText } from '@/ai/flows/extract-data-flow';

interface TextImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ExtractedData) => void;
}

export function TextImporter({ open, onOpenChange, onImport }: TextImporterProps) {
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!textToAnalyze.trim()) {
      toast({
        variant: 'destructive',
        title: 'Aucun texte fourni',
        description: 'Veuillez coller le texte à analyser.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await extractDataFromText({ text: textToAnalyze });
      
      // Post-process the extracted data
      const processedData: ExtractedData = {
        ...result,
        familyContacts: (result.familyContacts || []).map(contact => {
          let cleanEmail = contact.email || "";
          const emailMatch = cleanEmail.match(/\[(.*?)\]/);
          if (emailMatch) {
              cleanEmail = emailMatch[1];
          }
          return { ...contact, email: cleanEmail };
        })
      };

      onImport(processedData);
      onOpenChange(false);
      setTextToAnalyze('');
    } catch (error: any) {
      console.error("Analysis or Import Error:", error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'analyse du texte",
        description: `Une erreur est survenue. Erreur : ${error.message}`,
        duration: 9000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importer les données par analyse de texte</DialogTitle>
            <DialogDescription>
              Collez un texte brut (GEVASco, compte-rendu...). L'IA l'analysera pour pré-remplir automatiquement les champs du PPI.
            </DialogDescription>
             <div className="pt-4">
               <Button asChild variant="outline">
                    <Link href="https://chatgpt.com/g/g-689ca48c5530819198ff061fb06f1e49-gevasco-vers-ppimanager" target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Utiliser le GPT GevaSco (optionnel)
                    </Link>
                </Button>
            </div>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Collez ici le texte à analyser..."
              className="min-h-[300px] font-mono text-xs"
              value={textToAnalyze}
              onChange={(e) => setTextToAnalyze(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyser et Importer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
