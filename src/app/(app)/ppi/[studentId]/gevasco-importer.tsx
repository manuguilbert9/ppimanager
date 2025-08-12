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
        const updatedStudentData: Partial<Student> = {};

        // Merge administrative data, only if the extracted data is not empty
        if (extractedData.administrativeData) {
            const { birthDate, level, mdphNotificationTitle, mdphNotificationExpiration, familyContacts } = extractedData.administrativeData;
            if (birthDate) updatedStudentData.birthDate = birthDate;
            if (level) updatedStudentData.level = level;
            if (mdphNotificationTitle) updatedStudentData.mdphNotificationTitle = mdphNotificationTitle;
            if (mdphNotificationExpiration) updatedStudentData.mdphNotificationExpiration = mdphNotificationExpiration;
            
            if (familyContacts && familyContacts.length > 0) {
              const existingContacts = student.familyContacts || [];
              const newContacts = familyContacts.filter(
                newContact => !existingContacts.some(existing => existing.name.toLowerCase() === newContact.name.toLowerCase())
              );
              updatedStudentData.familyContacts = [...existingContacts, ...newContacts];
            }
        }
        
        const mergeCategory = (category: 'strengths' | 'difficulties' | 'needs' | 'globalProfile') => {
            if (!extractedData[category]) return;

            const existingData = student[category] || {};
            const extractedCategoryData = extractedData[category] || {};
            
            // @ts-ignore
            const mergedData: typeof existingData = { ...existingData };
            
            Object.keys(extractedCategoryData).forEach(key => {
                const subKey = key as keyof typeof extractedCategoryData;
                 // @ts-ignore
                const existingItems = existingData[subKey] || [];
                 // @ts-ignore
                const newItems = extractedCategoryData[subKey] || [];
                
                if (Array.isArray(existingItems) && Array.isArray(newItems)) {
                    // @ts-ignore
                    mergedData[subKey] = Array.from(new Set([...existingItems, ...newItems]));
                }
            });
            // @ts-ignore
            updatedStudentData[category] = mergedData;
        };

        mergeCategory('strengths');
        mergeCategory('difficulties');
        mergeCategory('needs');
        mergeCategory('globalProfile');
        
        await updateStudent(student.id, updatedStudentData);
      
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
  
  const renderExtractedData = () => {
    if (!extractedData) return null;
  
    const dataToRender = { ...extractedData };
    
    const isEmpty = Object.values(dataToRender).every(category => {
      if (!category) return true;
      if (Object.keys(category).length === 0) return true;
      return Object.values(category).every(value => !value || (Array.isArray(value) && value.length === 0));
    });

    if (isEmpty) {
        return <p>L'IA n'a trouvé aucune information à extraire dans ce document.</p>;
    }

    return (
      <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-sm">
        {extractedData.administrativeData && Object.keys(extractedData.administrativeData).length > 0 && (
            <div>
              <h3 className="font-semibold text-lg capitalize mb-2">Données Administratives</h3>
              <ul className="list-disc pl-5 space-y-1">
                {extractedData.administrativeData.birthDate && <li><b>Date de naissance:</b> {extractedData.administrativeData.birthDate}</li>}
                {extractedData.administrativeData.level && <li><b>Niveau:</b> {extractedData.administrativeData.level}</li>}
                {extractedData.administrativeData.mdphNotificationTitle && <li><b>Notification MDPH:</b> {extractedData.administrativeData.mdphNotificationTitle}</li>}
                {extractedData.administrativeData.mdphNotificationExpiration && <li><b>Échéance MDPH:</b> {extractedData.administrativeData.mdphNotificationExpiration}</li>}
                {extractedData.administrativeData.familyContacts && extractedData.administrativeData.familyContacts.map((contact, index) => (
                  <li key={`contact-${index}`}><b>{contact.title}:</b> {contact.name}</li>
                ))}
              </ul>
            </div>
        )}

        {Object.entries(extractedData).map(([category, values]) => {
          if (category === 'administrativeData' || !values || Object.keys(values).length === 0) return null;
          
          const categoryHasValues = Object.values(values).some(v => Array.isArray(v) && v.length > 0);
          if (!categoryHasValues) return null;

          return (
            <div key={category}>
              <h3 className="font-semibold text-lg capitalize mb-2">{category.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</h3>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(values).map(([subCategory, items]) => (
                  (items as string[]).map((item, index) => (
                     <li key={`${subCategory}-${index}`}>{item}</li>
                  ))
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    )
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

          {extractedData && renderExtractedData()}

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
