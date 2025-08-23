
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

interface TextImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ExtractedData) => void;
}

export function TextImporter({ open, onOpenChange, onImport }: TextImporterProps) {
  const [jsonText, setJsonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImportJson = () => {
    let textToParse = jsonText.trim();
    if (!textToParse) {
      toast({
        variant: 'destructive',
        title: 'Aucun texte fourni',
        description: 'Veuillez coller le JSON à importer.',
      });
      return;
    }

    // 1. Clean up markdown code blocks
    if (textToParse.startsWith('```json')) {
      textToParse = textToParse.substring(7);
    } else if (textToParse.startsWith('```')) {
      textToParse = textToParse.substring(3);
    }
    if (textToParse.endsWith('```')) {
      textToParse = textToParse.slice(0, -3);
    }
    textToParse = textToParse.trim();

    // 2. Fix for double-encoded JSON strings (e.g., \" instead of ")
    textToParse = textToParse.replace(/\\"/g, '"');
    
    // 3. Remove illegal control characters (like newlines) inside string literals
    textToParse = textToParse.replace(/[\x00-\x1F\x7F]/g, (char) => {
        // Allow tab and newline to be escaped, remove others.
        if (char === '\n') return '\\n';
        if (char === '\t') return '\\t';
        return '';
    });


    setIsLoading(true);
    try {
      const data: ExtractedData = JSON.parse(textToParse);
      onImport(data);
      onOpenChange(false);
      setJsonText('');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'importation du JSON",
        description: `Le format est invalide. Erreur : ${error.message}`,
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
            <DialogTitle>Importer les données depuis un JSON</DialogTitle>
            <DialogDescription>
              Collez le texte au format JSON ci-dessous. Il sera utilisé pour pré-remplir automatiquement les champs du PPI.
            </DialogDescription>
             <div className="pt-4">
               <Button asChild variant="outline">
                    {/* MODIFICATION : Collez votre lien ici */}
                    <Link href="https://chatgpt.com/g/g-689ca48c5530819198ff061fb06f1e49-gevasco-vers-flashppi" target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        GevaSco vers FlashPPI
                    </Link>
                </Button>
            </div>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Collez ici le JSON..."
              className="min-h-[300px] font-mono text-xs"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleImportJson} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importation en cours...
                </>
              ) : (
                'Importer le JSON'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
