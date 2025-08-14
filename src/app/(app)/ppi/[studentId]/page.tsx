
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
import { getAllLibraryItems } from '@/lib/library-repository';
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
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<z.infer<typeof ppiFormSchema>>({
    resolver: zodResolver(ppiFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      const studentData = await getStudent(params.studentId);
      if (!studentData) {
        notFound();
      }
      setStudent(studentData);
      
      const libraryData = await getAllLibraryItems();
      setLibraryItems(libraryData);
      
      const classesData = await getClasses();
      setClasses(classesData);
    };

    fetchData();
  }, [params.studentId]);

  useEffect(() => {
    if (student) {
      const defaultValues = {
        // Administrative
        firstName: student.firstName,
        lastName: student.lastName,
        birthDate: student.birthDate || '',
        sex: student.sex,
        school: student.school || '',
        level: student.level || '',
        mdphNotificationTitle: student.mdphNotificationTitle || '',
        mdphNotificationExpiration: student.mdphNotificationExpiration || '',
        familyContacts: student.familyContacts || [],
        classId: student.classId,
        // Global Profile
        globalProfile: student.globalProfile || {},
        // Strengths
        strengths: student.strengths || {},
        // Difficulties
        difficulties: student.difficulties || {},
        // Needs
        needs: student.needs || {},
        // Objectives
        objectives: (student.objectives || []).map(o => ({
            ...o,
            id: o.id || Math.random().toString(36).substring(7),
        })),
      };
      methods.reset(defaultValues);
    }
  }, [student, methods]);

  const handleImport = async (data: ExtractedData) => {
    if (!student) return;

    const updatedStudentData = cloneDeep(student);

    // Merge direct properties
    if (data.firstName) updatedStudentData.firstName = data.firstName;
    if (data.lastName) updatedStudentData.lastName = data.lastName;
    if (data.birthDate) updatedStudentData.birthDate = data.birthDate;
    if (data.school) updatedStudentData.school = data.school;
    if (data.level) updatedStudentData.level = data.level;

    // Replace family contacts if provided
    if (data.familyContacts && data.familyContacts.length > 0) {
      updatedStudentData.familyContacts = data.familyContacts.map(c => ({
        id: Math.random().toString(36).substring(7),
        title: c.title ?? "",
        name: c.name ?? "",
        phone: c.phone,
        email: c.email,
        street: c.street,
        postalCode: c.postalCode,
        city: c.city,
      }));
    }

    // Merge nested objects
    if (data.globalProfile) {
        updatedStudentData.globalProfile = { ...updatedStudentData.globalProfile, ...data.globalProfile };
    }
    if (data.strengths) {
        updatedStudentData.strengths = { ...updatedStudentData.strengths, ...data.strengths };
    }
    if (data.difficulties) {
        updatedStudentData.difficulties = { ...updatedStudentData.difficulties, ...data.difficulties };
    }

    try {
        await updateStudent(student.id, updatedStudentData);
        setStudent(updatedStudentData);
        toast({
          title: 'Importation réussie',
          description: 'Les informations ont été mises à jour dans le PPI.',
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

  if (!student) {
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
