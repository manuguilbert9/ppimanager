
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getStudents } from '@/lib/students-repository';
import type { Student, Objective } from '@/types';
import { Loader2, User, Calendar, WandSparkles, Save } from 'lucide-react';
import { useDataFetching } from '@/hooks/use-data-fetching';
import Link from 'next/link';
import { groupObjectives, type StudentObjectiveGroup, type StudentObjectiveProfile } from '@/ai/flows/group-objectives-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { addGroup } from '@/lib/groups-repository';

export default function PilotagePage() {
  const { data: students, loading: loadingStudents } = useDataFetching(getStudents);
  const { toast } = useToast();

  const [objectiveGroups, setObjectiveGroups] = useState<StudentObjectiveGroup[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  const allActiveObjectives = useMemo<StudentObjectiveProfile[]>(() => {
    if (!students) return [];
    return students
      .filter((student) => student.ppiStatus !== 'archived')
      .flatMap((student) =>
        (student.objectives || [])
          .filter((objective) => objective.title && !objective.validationDate)
          .map((objective) => ({
            objectiveTitle: objective.title,
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            deadline: objective.deadline,
            level: student.level,
            strengths: student.strengths,
          }))
      );
  }, [students]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setObjectiveGroups([]);
    try {
      const result = await groupObjectives({ objectives: allActiveObjectives });
      setObjectiveGroups(result.groups);
      setAnalysisDone(true);
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        variant: 'destructive',
        title: "Erreur de l'analyse IA",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSaveGroup = async (group: StudentObjectiveGroup, index: number) => {
    setSavingStates(prev => ({ ...prev, [index]: true }));
    try {
        await addGroup(group);
        toast({
            title: "Groupe enregistré",
            description: `Le groupe "${group.groupTitle}" a été sauvegardé avec succès.`,
        });
    } catch (error) {
         toast({
            variant: 'destructive',
            title: "Erreur lors de la sauvegarde",
            description: "Une erreur est survenue. Veuillez réessayer.",
        });
    } finally {
        setSavingStates(prev => ({ ...prev, [index]: false }));
    }
  }
  
  const loading = loadingStudents || isAnalyzing;

  return (
    <>
      <PageHeader
        title="Pilotage des apprentissages"
        description="Utilisez l'IA pour regrouper les élèves par objectifs similaires et organiser des ateliers."
      >
        <Button onClick={handleAnalyze} disabled={loading || allActiveObjectives.length === 0}>
          {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
          Lancer l'analyse par IA
        </Button>
      </PageHeader>
      
      {loading && (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
            {isAnalyzing && <p className="ml-4 text-muted-foreground">Analyse IA en cours...</p>}
        </div>
      )}

      {!loading && !analysisDone && (
         <Alert>
          <WandSparkles className="h-4 w-4" />
          <AlertTitle>Prêt pour l'analyse !</AlertTitle>
          <AlertDescription>
            {allActiveObjectives.length > 0
              ? `Il y a ${allActiveObjectives.length} objectifs actifs à analyser. Cliquez sur "Lancer l'analyse par IA" pour créer des groupes de travail pertinents.`
              : "Aucun objectif actif à analyser pour le moment. Ajoutez des objectifs aux PPI de vos élèves."}
          </AlertDescription>
        </Alert>
      )}

      {!loading && analysisDone && objectiveGroups.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              L'analyse IA n'a pas pu former de groupes. Vérifiez que des objectifs sont bien définis pour les élèves.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && objectiveGroups.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {objectiveGroups.map((group, index) => {
            const isSaving = savingStates[index];
            return (
                <Card key={group.groupTitle} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="text-lg">{group.groupTitle}</CardTitle>
                    <CardDescription>
                    <span className="font-semibold">Justification :</span> {group.rationale}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <ul className="space-y-3">
                    {group.students.map((student) => (
                        <li key={student.id} className="flex flex-col p-3 bg-background rounded-md border">
                            <div className="flex items-center gap-2 font-medium">
                                <User className="h-4 w-4 text-primary" />
                                <Link href={`/ppi/${student.id}`} className="hover:underline">
                                    {student.name}
                                </Link>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 pl-1">
                                <span className="font-semibold">Objectif :</span> {student.objectiveTitle}
                            </p>
                            {student.deadline && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 pl-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Échéance: {student.deadline}</span>
                                </div>
                            )}
                        </li>
                    ))}
                    </ul>
                </CardContent>
                <div className="p-4 pt-0">
                    <Button onClick={() => handleSaveGroup(group, index)} disabled={isSaving} className="w-full">
                         {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                         {isSaving ? 'Sauvegarde...' : 'Enregistrer le groupe'}
                    </Button>
                </div>
                </Card>
            )
          })}
        </div>
      )}
    </>
  );
}
