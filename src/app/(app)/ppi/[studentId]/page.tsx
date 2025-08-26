
'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStudent, updateStudent } from '@/lib/students-repository';
import { notFound, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlobalProfileForm, globalProfileSchema } from './global-profile';
import { StrengthsForm, strengthsSchema } from './strengths-form';
import { getAllLibraryItems, addLibraryItems } from '@/lib/library-repository';
import { DifficultiesForm, difficultiesSchema } from './difficulties-form';
import { NeedsForm, needsSchema } from './needs-form';
import { ObjectivesForm, objectivesSchema } from './objectives-form';
import { AdministrativeForm, administrativeSchema } from './administrative-form';
import { getClasses } from '@/lib/classes-repository';
import { TextImporter } from './text-importer';
import { Loader2 } from 'lucide-react';
import type { Student, Classe, LibraryItem } from '@/types';
import type { ExtractedData } from '@/types/schemas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cloneDeep } from 'lodash';
import { SavePpiButton } from './save-ppi-button';
import { GenerateProseButton } from './generate-prose-button';

const ppiFormSchema = administrativeSchema
  .merge(globalProfileSchema)
  .merge(strengthsSchema)
  .merge(difficultiesSchema)
  .merge(needsSchema)
  .merge(objectivesSchema);


export default function PpiStudentPage({ params }: { params: { studentId: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<z.infer<typeof ppiFormSchema>>({
    resolver: zodResolver(ppiFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      setErrorLoading(false);
      try {
        const studentData = await getStudent(params.studentId);
        if (!studentData) {
          notFound();
          return;
        }
        setStudent(studentData);
        
        const libraryData = await getAllLibraryItems();
        setLibraryItems(libraryData);
        
        const classesData = await getClasses();
        setClasses(classesData);

        // Reset form here after all data is fetched
        if (studentData && classesData.length > 0) {
            const defaultValues = {
                // Administrative
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
                // Global Profile
                globalProfile: studentData.globalProfile || {},
                // Strengths
                strengths: studentData.strengths || {},
                // Difficulties
                difficulties: studentData.difficulties || {},
                // Needs
                needs: studentData.needs || {},
                // Objectives
                objectives: (studentData.objectives || []).map(o => ({
                    ...o,
                    id: o.id || Math.random().toString(36).substring(7),
                })),
            };
            methods.reset(defaultValues);
        }
      } catch (error) {
        console.error("Failed to fetch page data:", error);
        setErrorLoading(true);
      }
    };

    fetchData();
  }, [params.studentId, methods]);


  const handleImport = async (data: ExtractedData) => {
    if (!student) return;

    // Save all new items to the library first
    if (data.globalProfile) {
        if (data.globalProfile.disabilityNatures) addLibraryItems(data.globalProfile.disabilityNatures, 'disabilityNatures');
        if (data.globalProfile.associatedDisorders) addLibraryItems(data.globalProfile.associatedDisorders, 'associatedDisorders');
        if (data.globalProfile.medicalNeeds) addLibraryItems(data.globalProfile.medicalNeeds, 'medicalNeeds');
        if (data.globalProfile.hobbies) addLibraryItems(data.globalProfile.hobbies, 'hobbies');
    }
    if (data.strengths) {
        if (data.strengths.academicSkills) addLibraryItems(data.strengths.academicSkills, 'academicSkills');
        if (data.strengths.cognitiveStrengths) addLibraryItems(data.strengths.cognitiveStrengths, 'cognitiveStrengths');
        if (data.strengths.socialSkills) addLibraryItems(data.strengths.socialSkills, 'socialSkills');
        if (data.strengths.exploitableInterests) addLibraryItems(data.strengths.exploitableInterests, 'exploitableInterests');
    }
    if (data.difficulties) {
        if (data.difficulties.cognitiveDifficulties) addLibraryItems(data.difficulties.cognitiveDifficulties, 'cognitiveDifficulties');
        if (data.difficulties.schoolDifficulties) addLibraryItems(data.difficulties.schoolDifficulties, 'schoolDifficulties');
        if (data.difficulties.motorDifficulties) addLibraryItems(data.difficulties.motorDifficulties, 'motorDifficulties');
        if (data.difficulties.socioEmotionalDifficulties) addLibraryItems(data.difficulties.socioEmotionalDifficulties, 'socioEmotionalDifficulties');
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
        // We also need to reset the form with the newly imported data
        methods.reset(updatedStudentData);
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
      methods.reset(values); // Reset form with new values to mark it as "clean"
      return true; // Indicate success
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
      });
      return false; // Indicate failure
    }
  };

  if (!student || classes.length === 0 || errorLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <PageHeader
          title={`PPI de ${student.firstName} ${student.lastName}`}
          description="Profil global de l'élève et synthèse de son projet."
        >
          <div className="flex items-center gap-3">
            <GenerateProseButton student={methods.getValues()} />
            <Button variant="outline" type="button" onClick={() => setIsImporting(true)}>
               Importer des données
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

        <div className="space-y-8">
          <AdministrativeForm classes={classes} />
          <GlobalProfileForm 
            disabilityNaturesSuggestions={getSuggestions('disabilityNatures')}
            associatedDisordersSuggestions={getSuggestions('associatedDisorders')}
            medicalNeedsSuggestions={getSuggestions('medicalNeeds')}
            equipmentSuggestions={getSuggestions('equipment')}
            hobbiesSuggestions={getSuggestions('hobbies')}
          />
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
          <NeedsForm
              pedagogicalAccommodationsSuggestions={getSuggestions('pedagogicalAccommodations')}
              humanAssistanceSuggestions={getSuggestions('humanAssistance')}
              compensatoryToolsSuggestions={getSuggestions('compensatoryTools')}
              specialEducationalApproachSuggestions={getSuggestions('specialEducationalApproach')}
              complementaryCareSuggestions={getSuggestions('complementaryCare')}
          />
          <ObjectivesForm
            student={student} 
            objectivesSuggestions={getSuggestions('objectives')}
            adaptationsSuggestions={getSuggestions('adaptations')}
          />
        </div>
        
        <SavePpiButton onSubmit={methods.handleSubmit(onSubmit)} />

      </form>
    </FormProvider>
  );
}

    