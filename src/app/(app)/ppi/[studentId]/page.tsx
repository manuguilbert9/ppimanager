'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStudent, updateStudent } from '@/lib/students-repository';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlobalProfileForm, globalProfileSchema } from './global-profile';
import { StrengthsForm, strengthsSchema } from './strengths-form';
import { getAllLibraryItems, addLibraryItems } from '@/lib/library-repository';
import { useAuth } from '@/hooks/use-auth';
import { DifficultiesForm, difficultiesSchema } from './difficulties-form';
import { NeedsForm, needsSchema } from './needs-form';
import { ObjectivesForm, objectivesSchema } from './objectives-form';
import { AdministrativeForm, administrativeSchema } from './administrative-form';
import { TroublesForm, troublesSchema } from './troubles-form';
import { AcademicLevelsForm, academicLevelsSchema } from './academic-levels-form';
import { ObservationForm, observationsSchema } from './observation-form';
import { PriorityNeedsForm, priorityNeedsSchema } from './priority-needs-form';
import { EvaluationForm, evaluationSchema } from './evaluation-form';
import { notesSchema } from './notes-form';
import { getClasses } from '@/lib/classes-repository';
import { TextImporter } from './text-importer';
import {
  Loader2,
  FolderOpen,
  UserSearch,
  Eye,
  ListOrdered,
  Target,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  FileDown,
} from 'lucide-react';
import type { Student, Classe, LibraryItem } from '@/types';
import type { ExtractedData } from '@/types/schemas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cloneDeep } from 'lodash';
import { cn } from '@/lib/utils';
import { generateDocx } from '@/lib/docx-exporter';
import { GenerateProseButton } from './generate-prose-button';
import { PpiStatusChanger } from '../../ppi/ppi-status-changer';
import { PpiNotesDrawer } from './ppi-notes-drawer';
import { SavePpiButton } from './save-ppi-button';

const ppiFormSchema = administrativeSchema
  .merge(globalProfileSchema)
  .merge(troublesSchema)
  .merge(academicLevelsSchema)
  .merge(strengthsSchema)
  .merge(difficultiesSchema)
  .merge(observationsSchema)
  .merge(needsSchema)
  .merge(priorityNeedsSchema)
  .merge(objectivesSchema)
  .merge(evaluationSchema)
  .merge(notesSchema);

export type PpiFormValues = z.infer<typeof ppiFormSchema>;

/**
 * Les étapes du parcours, suivant la démarche d'élaboration du PPI
 * (B. Egron, « Enseigner en unité d'enseignement ») : recueillir les
 * informations, connaître l'élève, observer ses fonctionnements, identifier
 * et hiérarchiser ses besoins, définir objectifs et moyens, évaluer et
 * réguler.
 */
const STEPS = [
  {
    id: 'recueil',
    title: 'Recueil d\'informations',
    shortTitle: 'Recueil',
    description: 'Données administratives, famille, parcours scolaire, suivis (GEVA-Sco, dossier, échanges).',
    icon: FolderOpen,
  },
  {
    id: 'profil',
    title: 'Profil de l\'élève',
    shortTitle: 'Profil',
    description: 'Troubles et leurs incidences, niveaux scolaires, points d\'appui et difficultés.',
    icon: UserSearch,
  },
  {
    id: 'observation',
    title: 'Observation des fonctionnements',
    shortTitle: 'Observation',
    description: 'La grille d\'observation : des faits, dans une pluralité de situations et de regards.',
    icon: Eye,
  },
  {
    id: 'besoins',
    title: 'Besoins éducatifs',
    shortTitle: 'Besoins',
    description: 'Analyser les observations, identifier les besoins, puis hiérarchiser : faire des choix.',
    icon: ListOrdered,
  },
  {
    id: 'objectifs',
    title: 'Objectifs et moyens',
    shortTitle: 'Objectifs',
    description: 'Objectifs référés aux programmes, opérationnalisés, avec démarches et adaptations.',
    icon: Target,
  },
  {
    id: 'evaluation',
    title: 'Évaluation et suivi',
    shortTitle: 'Suivi',
    description: 'Modalités d\'évaluation des progrès, bilans périodiques et régulation du projet.',
    icon: CalendarCheck,
  },
] as const;

export default function PpiStudentPage({ params }: { params: { studentId: string } }) {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const methods = useForm<z.infer<typeof ppiFormSchema>>({
    resolver: zodResolver(ppiFormSchema),
    defaultValues: {},
  });

  const { formState: { isDirty, isSubmitting } } = methods;

  const buildDefaultValues = (studentData: Student) => ({
    // Administratif
    firstName: studentData.firstName,
    lastName: studentData.lastName,
    birthDate: studentData.birthDate || '',
    sex: studentData.sex,
    school: studentData.school || '',
    level: studentData.level || '',
    mdphNotificationTitle: studentData.mdphNotificationTitle || '',
    mdphNotificationExpiration: studentData.mdphNotificationExpiration || '',
    familyContacts: studentData.familyContacts || [],
    classId: studentData.classId,
    // Profil global
    globalProfile: studentData.globalProfile || {},
    // Troubles et niveaux
    troubleIds: studentData.troubleIds || [],
    academicLevels: studentData.academicLevels || [],
    // Points d'appui / difficultés
    strengths: studentData.strengths || {},
    difficulties: studentData.difficulties || {},
    // Observation
    observations: studentData.observations || {},
    // Besoins
    needs: studentData.needs || {},
    priorityNeeds: studentData.priorityNeeds || [],
    // Objectifs
    objectives: (studentData.objectives || []).map(o => ({
      ...o,
      id: o.id || Math.random().toString(36).substring(7),
    })),
    // Évaluation et suivi
    evaluationPlan: studentData.evaluationPlan || {},
    reviews: studentData.reviews || [],
    ppiStatus: studentData.ppiStatus,
    notes: studentData.notes || '',
  });

  const fetchData = async () => {
    if (!user) return;
    setErrorLoading(false);
    try {
      const studentData = await getStudent(params.studentId);
      if (!studentData) {
        setErrorLoading(true);
        return;
      }
      setStudent(studentData);

      const libraryData = await getAllLibraryItems(user.uid);
      setLibraryItems(libraryData);

      const classesData = await getClasses(user.uid);
      setClasses(classesData);

      if (studentData && classesData.length > 0) {
        methods.reset(buildDefaultValues(studentData));
      }
    } catch (error) {
      console.error("Failed to fetch page data:", error);
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.studentId]);

  const handleImport = async (data: ExtractedData) => {
    if (!student) return;

    // Save all new items to the library first
    const uid = user!.uid;
    if (data.globalProfile) {
        if (data.globalProfile.disabilityNatures) addLibraryItems(data.globalProfile.disabilityNatures, 'disabilityNatures', uid);
        if (data.globalProfile.associatedDisorders) addLibraryItems(data.globalProfile.associatedDisorders, 'associatedDisorders', uid);
        if (data.globalProfile.medicalNeeds) addLibraryItems(data.globalProfile.medicalNeeds, 'medicalNeeds', uid);
        if (data.globalProfile.hobbies) addLibraryItems(data.globalProfile.hobbies, 'hobbies', uid);
    }
    if (data.strengths) {
        if (data.strengths.academicSkills) addLibraryItems(data.strengths.academicSkills, 'academicSkills', uid);
        if (data.strengths.cognitiveStrengths) addLibraryItems(data.strengths.cognitiveStrengths, 'cognitiveStrengths', uid);
        if (data.strengths.socialSkills) addLibraryItems(data.strengths.socialSkills, 'socialSkills', uid);
        if (data.strengths.exploitableInterests) addLibraryItems(data.strengths.exploitableInterests, 'exploitableInterests', uid);
    }
    if (data.difficulties) {
        if (data.difficulties.cognitiveDifficulties) addLibraryItems(data.difficulties.cognitiveDifficulties, 'cognitiveDifficulties', uid);
        if (data.difficulties.schoolDifficulties) addLibraryItems(data.difficulties.schoolDifficulties, 'schoolDifficulties', uid);
        if (data.difficulties.motorDifficulties) addLibraryItems(data.difficulties.motorDifficulties, 'motorDifficulties', uid);
        if (data.difficulties.socioEmotionalDifficulties) addLibraryItems(data.difficulties.socioEmotionalDifficulties, 'socioEmotionalDifficulties', uid);
    }

    const updatedStudentData = cloneDeep(student);

    // Merge direct properties
    if (data.firstName) updatedStudentData.firstName = data.firstName;
    if (data.lastName) updatedStudentData.lastName = data.lastName;
    if (data.birthDate) updatedStudentData.birthDate = data.birthDate;
    if (data.school) updatedStudentData.school = data.school;
    if (data.level) updatedStudentData.level = data.level;

    // Replace family contacts if provided
    if (data.familyContacts && data.familyContacts.length > 0) {
      updatedStudentData.familyContacts = data.familyContacts.map(c => {
        let cleanEmail = c.email || "";
        const emailMatch = cleanEmail.match(/\[(.*?)\]/);
        if (emailMatch) {
            cleanEmail = emailMatch[1];
        }

        return {
            id: Math.random().toString(36).substring(7),
            title: c.title ?? "",
            name: c.name ?? "",
            phone: c.phone,
            email: cleanEmail,
            street: c.street,
            postalCode: c.postalCode,
            city: c.city,
        };
      });
    }

    // Helper function to merge array fields without duplicates
    const mergeArrayField = (target: string[] | undefined, source: string[] | undefined): string[] => {
        const targetSet = new Set(target || []);
        (source || []).forEach(item => targetSet.add(item));
        return Array.from(targetSet);
    };

    // Merge nested objects
    if (data.globalProfile) {
        updatedStudentData.globalProfile = {
            ...updatedStudentData.globalProfile,
            ...data.globalProfile,
            disabilityNatures: mergeArrayField(updatedStudentData.globalProfile?.disabilityNatures, data.globalProfile.disabilityNatures),
            associatedDisorders: mergeArrayField(updatedStudentData.globalProfile?.associatedDisorders, data.globalProfile.associatedDisorders),
            medicalNeeds: mergeArrayField(updatedStudentData.globalProfile?.medicalNeeds, data.globalProfile.medicalNeeds),
            hobbies: mergeArrayField(updatedStudentData.globalProfile?.hobbies, data.globalProfile.hobbies),
        };
    }
    if (data.strengths) {
        updatedStudentData.strengths = {
            ...updatedStudentData.strengths,
            ...data.strengths,
            academicSkills: mergeArrayField(updatedStudentData.strengths?.academicSkills, data.strengths.academicSkills),
            cognitiveStrengths: mergeArrayField(updatedStudentData.strengths?.cognitiveStrengths, data.strengths.cognitiveStrengths),
            socialSkills: mergeArrayField(updatedStudentData.strengths?.socialSkills, data.strengths.socialSkills),
            exploitableInterests: mergeArrayField(updatedStudentData.strengths?.exploitableInterests, data.strengths.exploitableInterests),
        };
    }
    if (data.difficulties) {
        updatedStudentData.difficulties = {
            ...updatedStudentData.difficulties,
            ...data.difficulties,
            cognitiveDifficulties: mergeArrayField(updatedStudentData.difficulties?.cognitiveDifficulties, data.difficulties.cognitiveDifficulties),
            schoolDifficulties: mergeArrayField(updatedStudentData.difficulties?.schoolDifficulties, data.difficulties.schoolDifficulties),
            motorDifficulties: mergeArrayField(updatedStudentData.difficulties?.motorDifficulties, data.difficulties.motorDifficulties),
            socioEmotionalDifficulties: mergeArrayField(updatedStudentData.difficulties?.socioEmotionalDifficulties, data.difficulties.socioEmotionalDifficulties),
        };
    }

    try {
        await updateStudent(student.id, updatedStudentData);
        setStudent(updatedStudentData);
        methods.reset(buildDefaultValues(updatedStudentData));
        toast({
          title: 'Importation réussie',
          description: 'Les informations ont été mises à jour dans le PPI et la bibliothèque.',
        });
    } catch(e) {
        console.error("Failed to update student after import", e);
        toast({
          variant: 'destructive',
          title: 'Erreur de sauvegarde',
          description: 'Les données ont été analysées mais n\'ont pas pu être sauvegardées.',
        });
    }
  };

  const getSuggestions = (category: string) => {
    return libraryItems.filter(item => item.category === category).map(item => item.text);
  }

  const onSubmit = async (values: z.infer<typeof ppiFormSchema>) => {
    if (!student) return;
    try {
      await updateStudent(student.id, values);
      methods.reset(values, { keepValues: true, keepDirty: false });
      toast({
        title: 'Modifications enregistrées',
        description: `Le PPI de ${values.firstName} a été mis à jour.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
      });
    }
  };

  const handleExport = async () => {
    if (!student) return;
    setIsExporting(true);
    try {
      // Exporte l'état courant du formulaire (y compris non sauvegardé).
      const values = methods.getValues();
      const studentForExport: Student = {
        ...student,
        ...values,
        familyContacts: values.familyContacts || [],
      } as Student;
      const blob = await generateDocx(studentForExport);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `PPI_${student.lastName}_${student.firstName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'Document Word généré',
        description: `Le PPI de ${student.firstName} ${student.lastName} a été téléchargé.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'exportation",
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!student || classes.length === 0 || errorLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {errorLoading ? (
            <div className="text-center text-destructive">
                <p>Impossible de charger les données de l'élève.</p>
                <p className="text-sm">Veuillez vérifier votre connexion et réessayer.</p>
                <Button onClick={fetchData} className="mt-4">Réessayer</Button>
            </div>
        ) : (
            <Loader2 className="h-8 w-8 animate-spin" />
        )}
      </div>
    );
  }

  const ppiForStatusChanger = {
      id: student.id,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      status: student.ppiStatus,
      lastUpdate: student.lastUpdate,
  }

  const step = STEPS[currentStep];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <PageHeader
          title={`PPI de ${student.firstName} ${student.lastName}`}
          description="Projet pédagogique individualisé — démarche d'identification des besoins (B. Egron)."
        >
           <div className="flex items-center gap-3">
            <PpiStatusChanger ppi={ppiForStatusChanger} onStatusChanged={fetchData} as="button" />
            <GenerateProseButton student={methods.getValues()} />
            <Button variant="outline" type="button" onClick={() => setIsImporting(true)}>
               Importer des données
            </Button>
            <Button variant="default" type="button" onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Exporter en Word
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={student.avatarUrl}
                alt={`${student.firstName} ${student.lastName}`}
                data-ai-hint="person portrait"
              />
              <AvatarFallback>
                {student.firstName?.substring(0, 1)}
                {student.lastName?.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
          </div>
        </PageHeader>

        <TextImporter
          open={isImporting}
          onOpenChange={setIsImporting}
          onImport={handleImport}
        />

        {/* Barre d'étapes de la démarche */}
        <nav className="sticky top-0 z-10 -mx-2 mb-6 rounded-lg border bg-background/95 p-2 shadow-sm backdrop-blur">
          <ol className="flex flex-wrap items-center gap-1">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = index === currentStep;
              return (
                <li key={s.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium shadow'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold',
                        isActive ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10'
                      )}
                    >
                      {index + 1}
                    </span>
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{s.shortTitle}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="mx-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Étape {currentStep + 1} — {step.title}
          </h2>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>

        <div className="space-y-8">
          {step.id === 'recueil' && (
            <>
              <AdministrativeForm classes={classes} />
              <GlobalProfileForm
                disabilityNaturesSuggestions={getSuggestions('disabilityNatures')}
                associatedDisordersSuggestions={getSuggestions('associatedDisorders')}
                medicalNeedsSuggestions={getSuggestions('medicalNeeds')}
                equipmentSuggestions={getSuggestions('equipment')}
                hobbiesSuggestions={getSuggestions('hobbies')}
              />
            </>
          )}

          {step.id === 'profil' && (
            <>
              <TroublesForm />
              <AcademicLevelsForm />
              <StrengthsForm
                academicSkillsSuggestions={getSuggestions('academicSkills')}
                cognitiveStrengthsSuggestions={getSuggestions('cognitiveStrengths')}
                socialSkillsSuggestions={getSuggestions('socialSkills')}
                exploitableInterestsSuggestions={getSuggestions('exploitableInterests')}
              />
              <DifficultiesForm
                cognitiveDifficultiesSuggestions={getSuggestions('cognitiveDifficulties')}
                schoolDifficultiesSuggestions={getSuggestions('schoolDifficulties')}
                motorDifficultiesSuggestions={getSuggestions('motorDifficulties')}
                socioEmotionalDifficultiesSuggestions={getSuggestions('socioEmotionalDifficulties')}
                disabilityConstraintsSuggestions={getSuggestions('disabilityConstraints')}
              />
            </>
          )}

          {step.id === 'observation' && <ObservationForm />}

          {step.id === 'besoins' && (
            <>
              <NeedsForm
                pedagogicalAccommodationsSuggestions={getSuggestions('pedagogicalAccommodations')}
                humanAssistanceSuggestions={getSuggestions('humanAssistance')}
                compensatoryToolsSuggestions={getSuggestions('compensatoryTools')}
                specialEducationalApproachSuggestions={getSuggestions('specialEducationalApproach')}
                complementaryCareSuggestions={getSuggestions('complementaryCare')}
              />
              <PriorityNeedsForm />
            </>
          )}

          {step.id === 'objectifs' && (
            <ObjectivesForm
              objectivesSuggestions={getSuggestions('objectives')}
              adaptationsSuggestions={getSuggestions('adaptations')}
            />
          )}

          {step.id === 'evaluation' && <EvaluationForm />}
        </div>

        {/* Navigation bas de page */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => {
              setCurrentStep((s) => Math.max(0, s - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {currentStep > 0 ? STEPS[currentStep - 1].shortTitle : 'Précédent'}
          </Button>
          <span className="text-sm text-muted-foreground">
            Étape {currentStep + 1} / {STEPS.length}
          </span>
          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {STEPS[currentStep + 1].shortTitle}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Générer le document Word
            </Button>
          )}
        </div>

        <PpiNotesDrawer />
        <SavePpiButton isDirty={isDirty} isSubmitting={isSubmitting} />

      </form>
    </FormProvider>
  );
}
