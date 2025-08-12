'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Paperclip, Loader2, WandSparkles, AlertTriangle } from 'lucide-react';
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
import { extractGevascoData, ExtractGevascoOutput } from '@/ai/flows/extract-gevasco-flow';
import { updateStudent } from '@/lib/students-repository';
import type { Student } from '@/types';
import { useRouter } from 'next/navigation';

export function GevascoImporter({ student }: { student: Student }) {
  const [isImporting, setIsImporting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractGevascoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Fichier invalide',
        description: 'Veuillez sélectionner un fichier PDF.',
      });
      return;
    }

    setIsImporting(true);
    setError(null);
    setExtractedData(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64File = reader.result as string;
        try {
          const result = await extractGevascoData({ document: base64File });
          setExtractedData(result);
        } catch (aiError) {
          console.error(aiError);
          setError("L'extraction des données du PDF a échoué. L'IA n'a pas pu analyser le document. Il est peut-être corrompu ou dans un format inattendu.");
        } finally {
            setIsImporting(false);
        }
      };
      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier.');
        setIsImporting(false);
      }
    } catch (e) {
      setError('Une erreur inattendue est survenue.');
      setIsImporting(false);
    }
  };

  const handleApplyData = async () => {
    if (!extractedData) return;

    try {
        const updatedProfile = {
            strengths: {
                academicSkills: [...(student.strengths?.academicSkills || []), ...(extractedData.strengths?.academicSkills || [])],
                cognitiveStrengths: [...(student.strengths?.cognitiveStrengths || []), ...(extractedData.strengths?.cognitiveStrengths || [])],
                socialSkills: [...(student.strengths?.socialSkills || []), ...(extractedData.strengths?.socialSkills || [])],
                exploitableInterests: [...(student.strengths?.exploitableInterests || []), ...(extractedData.strengths?.exploitableInterests || [])],
            },
            difficulties: {
                cognitiveDifficulties: [...(student.difficulties?.cognitiveDifficulties || []), ...(extractedData.difficulties?.cognitiveDifficulties || [])],
                schoolDifficulties: [...(student.difficulties?.schoolDifficulties || []), ...(extractedData.difficulties?.schoolDifficulties || [])],
                motorDifficulties: [...(student.difficulties?.motorDifficulties || []), ...(extractedData.difficulties?.motorDifficulties || [])],
                socioEmotionalDifficulties: [...(student.difficulties?.socioEmotionalDifficulties || []), ...(extractedData.difficulties?.socioEmotionalDifficulties || [])],
                disabilityConstraints: [...(student.difficulties?.disabilityConstraints || []), ...(extractedData.difficulties?.disabilityConstraints || [])],
            },
            needs: {
                pedagogicalAccommodations: [...(student.needs?.pedagogicalAccommodations || []), ...(extractedData.needs?.pedagogicalAccommodations || [])],
                humanAssistance: [...(student.needs?.humanAssistance || []), ...(extractedData.needs?.humanAssistance || [])],
                compensatoryTools: [...(student.needs?.compensatoryTools || []), ...(extractedData.needs?.compensatoryTools || [])],
                specialEducationalApproach: [...(student.needs?.specialEducationalApproach || []), ...(extractedData.needs?.specialEducationalApproach || [])],
                complementaryCare: [...(student.needs?.complementaryCare || []), ...(extractedData.needs?.complementaryCare || [])],
            }
        };

        // Remove duplicates
        Object.keys(updatedProfile).forEach(key => {
            const category = key as keyof typeof updatedProfile;
            Object.keys(updatedProfile[category]).forEach(subKey => {
                const subCategory = subKey as keyof typeof updatedProfile[typeof category];
                // @ts-ignore
                updatedProfile[category][subCategory] = Array.from(new Set(updatedProfile[category][subCategory]));
            });
        });
        
        await updateStudent(student.id, updatedProfile);
      
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
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }

  return (
    <>
      <Alert>
        <WandSparkles className="h-4 w-4" />
        <AlertTitle>Gagnez du temps avec l'IA</AlertTitle>
        <AlertDescription>
          Importez un GevaSco au format PDF pour pré-remplir automatiquement les sections du PPI.
        </AlertDescription>
        <div className="mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/pdf"
            disabled={isImporting}
          />
          <Button onClick={triggerFileSelect} disabled={isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="mr-2 h-4 w-4" />
            )}
            {isImporting ? 'Analyse en cours...' : 'Importer un GevaSco'}
          </Button>
        </div>
      </Alert>

      <Dialog open={!!extractedData || !!error} onOpenChange={(open) => {
          if (!open) {
              setExtractedData(null);
              setError(null);
          }
      }}>
        <DialogContent className="max-w-2xl">
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

          {extractedData && (
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {Object.entries(extractedData).map(([category, values]) => (
                values && Object.keys(values).length > 0 && (
                  <div key={category}>
                    <h3 className="font-semibold text-lg capitalize mb-2">{category}</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {Object.entries(values).map(([subCategory, items]) => (
                        (items as string[]).map((item, index) => (
                           <li key={`${subCategory}-${index}`}>{item}</li>
                        ))
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setExtractedData(null); setError(null); }}>
              Annuler
            </Button>
            {!error && (
                <Button onClick={handleApplyData}>
                    Appliquer au PPI
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
