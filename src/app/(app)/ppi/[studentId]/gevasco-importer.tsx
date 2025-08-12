
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { extractGevascoData, ExtractGevascoOutput } from '@/ai/flows/extract-gevasco-flow';
import { updateStudent } from '@/lib/students-repository';
import type { Student } from '@/types';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  
  const handleUpdateExtractedData = (category: keyof ExtractGevascoOutput, subCategory: string, index: number, value: string) => {
    setExtractedData(prevData => {
        if (!prevData) return null;
        const newData = { ...prevData };
        // @ts-ignore
        const items = newData[category]?.[subCategory];
        if (items && Array.isArray(items)) {
            items[index] = value;
        }
        return newData;
    });
  };
  
  const handleDeleteExtractedItem = (category: keyof ExtractGevascoOutput, subCategory: string, index: number) => {
    setExtractedData(prevData => {
        if (!prevData) return null;
        const newData = { ...prevData };
        // @ts-ignore
        const items = newData[category]?.[subCategory];
        if (items && Array.isArray(items)) {
            items.splice(index, 1);
        }
        return newData;
    });
  };

  const handleUpdateExtractedAdminData = (field: string, value: string) => {
    setExtractedData(prevData => {
      if (!prevData) return null;
      const newData = { ...prevData };
      if (!newData.administrativeData) {
        newData.administrativeData = {};
      }
      // @ts-ignore
      newData.administrativeData[field] = value;
      return newData;
    })
  };

   const handleDeleteExtractedContact = (index: number) => {
    setExtractedData(prevData => {
      if (!prevData?.administrativeData?.familyContacts) return prevData;
      const newData = { ...prevData };
      newData.administrativeData.familyContacts.splice(index, 1);
      return newData;
    });
  };
  
  const handleUpdateExtractedContact = (index: number, field: 'title' | 'name', value: string) => {
    setExtractedData(prevData => {
      if (!prevData?.administrativeData?.familyContacts) return prevData;
      const newData = { ...prevData };
      // @ts-ignore
      newData.administrativeData.familyContacts[index][field] = value;
      return newData;
    });
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
                newContact => newContact.name && !existingContacts.some(existing => existing.name.toLowerCase() === newContact.name.toLowerCase())
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
                const newItems = (extractedCategoryData[subKey] || []).filter(item => item && item.trim() !== '');
                
                if (Array.isArray(existingItems) && Array.isArray(newItems) && newItems.length > 0) {
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
      if (typeof category !== 'object' || category === null) return true;
      return Object.values(category).every(value => !value || (Array.isArray(value) && value.length === 0));
    });

    if (isEmpty) {
        return <p>L'IA n'a trouvé aucune information à extraire dans ce document.</p>;
    }

    const categoryTitles: Record<string, string> = {
        globalProfile: 'Profil Global',
        strengths: 'Points Forts',
        difficulties: 'Difficultés',
        needs: 'Besoins',
    };
    
    const subCategoryTitles: Record<string, string> = {
        // Strengths
        academicSkills: "Compétences scolaires et académiques acquises",
        cognitiveStrengths: "Points forts cognitifs et comportementaux",
        socialSkills: "Habiletés sociales et de communication",
        exploitableInterests: "Centres d'intérêt exploitables",
        // Difficulties
        cognitiveDifficulties: "Difficultés d'ordre cognitif",
        schoolDifficulties: "Difficultés dans le cadre scolaire",
        motorDifficulties: "Difficultés motrices",
        socioEmotionalDifficulties: "Difficultés d'ordre social, émotionnel ou comportemental",
        disabilityConstraints: "Contraintes directes liées au handicap",
        // Needs
        pedagogicalAccommodations: "Aménagements pédagogiques",
        humanAssistance: "Aide humaine",
        compensatoryTools: "Outils de compensation",
        specialEducationalApproach: "Approches éducatives spécifiques",
        complementaryCare: "Soins ou rééducations complémentaires",
        // Global Profile
        disabilityNatures: "Diagnostics principaux",
        associatedDisorders: "Autres troubles associés",
        medicalNeeds: "Besoins médicaux spécifiques",
        equipment: "Appareillages utilisés",
    };

    return (
      <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6 text-sm">
        {extractedData.administrativeData && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Données Administratives</h3>
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <Label>Date de naissance</Label>
                          <Input value={extractedData.administrativeData.birthDate || ''} onChange={(e) => handleUpdateExtractedAdminData('birthDate', e.target.value)} />
                      </div>
                      <div>
                          <Label>Niveau</Label>
                          <Input value={extractedData.administrativeData.level || ''} onChange={(e) => handleUpdateExtractedAdminData('level', e.target.value)} />
                      </div>
                  </div>
                  <div>
                      <Label>Notification MDPH</Label>
                      <Input value={extractedData.administrativeData.mdphNotificationTitle || ''} onChange={(e) => handleUpdateExtractedAdminData('mdphNotificationTitle', e.target.value)} />
                  </div>
                  <div>
                      <Label>Échéance MDPH</Label>
                      <Input value={extractedData.administrativeData.mdphNotificationExpiration || ''} onChange={(e) => handleUpdateExtractedAdminData('mdphNotificationExpiration', e.target.value)} />
                  </div>

                  {extractedData.administrativeData.familyContacts && extractedData.administrativeData.familyContacts.length > 0 && (
                      <div>
                          <h4 className="font-medium text-md mt-4 mb-2">Contacts familiaux</h4>
                          {extractedData.administrativeData.familyContacts.map((contact, index) => (
                              <div key={index} className="flex items-end gap-2 mb-2">
                                  <div className="flex-1">
                                      <Label>Lien de parenté</Label>
                                      <Input value={contact.title} onChange={(e) => handleUpdateExtractedContact(index, 'title', e.target.value)} />
                                  </div>
                                  <div className="flex-1">
                                      <Label>Nom et Prénom</Label>
                                      <Input value={contact.name} onChange={(e) => handleUpdateExtractedContact(index, 'name', e.target.value)} />
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteExtractedContact(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </div>
        )}

        {Object.entries(extractedData).map(([category, values]) => {
          if (category === 'administrativeData' || !values || typeof values !== 'object') return null;
          
          const categoryHasValues = Object.values(values).some(v => Array.isArray(v) && v.length > 0);
          if (!categoryHasValues) return null;

          return (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-2">{categoryTitles[category] || category}</h3>
              <div className="space-y-4">
                {Object.entries(values).map(([subCategory, items]) => (
                  (Array.isArray(items) && items.length > 0) && (
                    <div key={subCategory}>
                        <h4 className="font-medium text-md mb-2">{subCategoryTitles[subCategory] || subCategory}</h4>
                        <div className="space-y-2">
                            {(items as string[]).map((item, index) => (
                                <div key={`${subCategory}-${index}`} className="flex items-center gap-2">
                                    <Input 
                                        value={item} 
                                        onChange={(e) => handleUpdateExtractedData(category as keyof ExtractGevascoOutput, subCategory, index, e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteExtractedItem(category as keyof ExtractGevascoOutput, subCategory, index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                  )
                ))}
              </div>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
                {error ? "Erreur d'importation" : 'Données extraites du GevaSco'}
            </DialogTitle>
            <DialogDescription>
              {error ? "Une erreur est survenue." : "Vérifiez et modifiez les informations extraites par l'IA avant de les appliquer au PPI."}
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

