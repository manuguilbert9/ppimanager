
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
    if (!jsonText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Aucun texte fourni',
        description: 'Veuillez coller le JSON à importer.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const data: ExtractedData = JSON.parse(jsonText);
      onImport(data);
      onOpenChange(false);
      setJsonText('');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'importation",
        description: "Le texte fourni n'est pas un JSON valide. Veuillez vérifier le format et réessayez.",
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
                    <Link href="#" target="_blank">
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
