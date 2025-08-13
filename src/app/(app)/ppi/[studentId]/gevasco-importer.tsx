
'use client';

import React, { useState, useTransition } from 'react';
import { Paperclip, Loader2, WandSparkles, AlertTriangle, User, FileText, HeartHand, Accessibility, Stethoscope } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function ExtractedDataSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    const hasContent = React.Children.toArray(children).some(child => child !== null && child !== undefined && (Array.isArray(child) ? child.length > 0 : true));
    if (!hasContent) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                {icon}
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>
            <div className="pl-8 space-y-3 text-sm">
                {children}
            </div>
            <Separator className="my-4" />
        </div>
    );
}

function DataField({ label, value }: { label: string, value?: string | null }) {
    if (!value) return null;
    return (
        <div>
            <p className="font-medium text-gray-600">{label}</p>
            <p className="text-gray-900">{value}</p>
        </div>
    )
}

function DataList({ label, items }: { label: string, items?: string[] | null }) {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <p className="font-medium text-gray-600">{label}</p>
            <div className="flex flex-wrap gap-2 mt-1">
                 {items.map((item, index) => <Badge key={index} variant="secondary" className="font-normal">{item}</Badge>)}
            </div>
        </div>
    )
}


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
          // Don't apply immediately, show dialog first
          // This will trigger a re-render showing the dialog
        }
      } catch (e) {
        console.error(e);
        setError('Une erreur inattendue est survenue.');
      }
    });
  };

  const handleApplyData = () => {
    // The data is already merged on the server during processGevascoFile
    // This action just closes the dialog and refreshes the page to show the new data
    if (!extractedData) return;

    toast({
        title: 'PPI mis à jour',
        description: "Les informations du GevaSco ont été fusionnées avec le profil de l'élève.",
    });
    setExtractedData(null);
    router.refresh();
  };


  const renderExtractedData = () => {
    if (!extractedData) return null;
  
    const dataToRender = { ...extractedData };
    
    const isEmpty = Object.values(dataToRender).every(category => {
        if (!category) return true;
        if (typeof category !== 'object' || category === null) return true;
        
        if (Array.isArray(category)) return category.length === 0;

        return Object.values(category).every(value => 
            !value || (Array.isArray(value) && value.length === 0)
        );
    });

    if (isEmpty) {
        return <p className="text-center text-muted-foreground p-8">L'IA n'a trouvé aucune information exploitable à extraire dans ce document.</p>;
    }
    
    return (
      <div className="max-h-[65vh] overflow-y-auto p-1 pr-4 space-y-6 text-sm">
        <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Vérification requise</AlertTitle>
            <AlertDescription>
                Les informations ci-dessous ont été extraites et fusionnées avec le profil existant.
                Vérifiez les données avant de fermer cette fenêtre.
            </AlertDescription>
        </Alert>
        
        {extractedData.administrativeData && (
          <ExtractedDataSection title="Données Administratives" icon={<FileText className="h-6 w-6 text-blue-600" />}>
              <DataField label="Date de naissance" value={extractedData.administrativeData.birthDate} />
              <DataField label="Niveau scolaire" value={extractedData.administrativeData.level} />
              <DataField label="Notification MDPH" value={extractedData.administrativeData.mdphNotificationTitle} />
              <DataField label="Expiration MDPH" value={extractedData.administrativeData.mdphNotificationExpiration} />
              {extractedData.administrativeData.familyContacts && (
                  <div>
                      <p className="font-medium text-gray-600">Contacts familiaux</p>
                      {extractedData.administrativeData.familyContacts.map((c, i) => (
                          <div key={i} className="pl-2 mt-1">
                              <Badge variant="outline">{c.title}: {c.name}</Badge>
                          </div>
                      ))}
                  </div>
              )}
          </ExtractedDataSection>
        )}

        {extractedData.globalProfile && (
           <ExtractedDataSection title="Profil Global" icon={<User className="h-6 w-6 text-amber-600" />}>
                <DataList label="Nature du handicap" items={extractedData.globalProfile.disabilityNatures} />
                <DataList label="Troubles associés" items={extractedData.globalProfile.associatedDisorders} />
                <DataList label="Besoins médicaux" items={extractedData.globalProfile.medicalNeeds} />
                <DataList label="Équipements" items={extractedData.globalProfile.equipment} />
           </ExtractedDataSection>
        )}
        
        {extractedData.strengths && (
            <ExtractedDataSection title="Points d'Appui" icon={<HeartHand className="h-6 w-6 text-green-600" />}>
                <DataList label="Compétences scolaires" items={extractedData.strengths.academicSkills} />
                <DataList label="Forces cognitives" items={extractedData.strengths.cognitiveStrengths} />
                <DataList label="Habiletés sociales" items={extractedData.strengths.socialSkills} />
                <DataList label="Intérêts" items={extractedData.strengths.exploitableInterests} />
            </ExtractedDataSection>
        )}
        
        {extractedData.difficulties && (
            <ExtractedDataSection title="Difficultés" icon={<Accessibility className="h-6 w-6 text-red-600" />}>
                <DataList label="Difficultés cognitives" items={extractedData.difficulties.cognitiveDifficulties} />
                <DataList label="Difficultés scolaires" items={extractedData.difficulties.schoolDifficulties} />
                <DataList label="Difficultés motrices" items={extractedData.difficulties.motorDifficulties} />
                <DataList label="Difficultés socio-émotionnelles" items={extractedData.difficulties.socioEmotionalDifficulties} />
                <DataList label="Contraintes du handicap" items={extractedData.difficulties.disabilityConstraints} />
            </ExtractedDataSection>
        )}
        
        {extractedData.needs && (
             <ExtractedDataSection title="Besoins Éducatifs" icon={<Stethoscope className="h-6 w-6 text-teal-600" />}>
                <DataList label="Aménagements pédagogiques" items={extractedData.needs.pedagogicalAccommodations} />
                <DataList label="Aide humaine" items={extractedData.needs.humanAssistance} />
                <DataList label="Outils de compensation" items={extractedData.needs.compensatoryTools} />
                <DataList label="Approche éducative" items={extractedData.needs.specialEducationalApproach} />
                <DataList label="Soins complémentaires" items={extractedData.needs.complementaryCare} />
            </ExtractedDataSection>
        )}

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
              if (extractedData) router.refresh(); // Refresh if data was applied
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

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => { setExtractedData(null); setError(null); }}>
              Fermer
            </Button>
            {!error && extractedData && (
                <Button onClick={handleApplyData}>
                    C'est noté, fermer
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
