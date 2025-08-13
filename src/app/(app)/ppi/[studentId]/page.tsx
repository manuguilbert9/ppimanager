
'use client';

import { useState, useEffect } from "react";
import { getStudent, updateStudent } from "@/lib/students-repository";
import { notFound, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalProfileForm } from "./global-profile";
import { StrengthsForm } from "./strengths-form";
import { getAllLibraryItems } from "@/lib/library-repository";
import { DifficultiesForm } from "./difficulties-form";
import { NeedsForm } from "./needs-form";
import { ObjectivesForm } from "./objectives-form";
import { AdministrativeForm } from "./administrative-form";
import { getClasses } from "@/lib/classes-repository";
import { TextImporter } from "./text-importer";
import { Loader2 } from "lucide-react";
import type { Student, Classe, LibraryItem } from "@/types";
import type { ExtractedData } from "@/ai/flows/extract-text-flow";
import { Button } from "@/components/ui/button";

export default function PpiStudentPage({ params }: { params: { studentId: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [pageKey, setPageKey] = useState(Date.now());
  const router = useRouter();

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
  }, [params.studentId, pageKey]);

  const handleImport = async (data: ExtractedData) => {
    if (!student) return;

    const updatedStudentData: Partial<Student> = {
        ...student, // Start with existing data
        
        // Overwrite simple fields if present in extracted data
        firstName: data.firstName || student.firstName,
        lastName: data.lastName || student.lastName,
        birthDate: data.birthDate || student.birthDate,
        school: data.school || student.school,
        level: data.level || student.level,

        // Replace contacts only if new ones were extracted
        familyContacts: data.familyContacts && data.familyContacts.length > 0
            ? data.familyContacts.map(c => ({
                id: Math.random().toString(36).substring(7),
                title: c.title ?? "",
                name: c.name ?? "",
                phone: c.phone,
                email: c.email,
                street: c.street,
                postalCode: c.postalCode,
                city: c.city,
            }))
            : student.familyContacts,

        // Merge nested objects correctly
        globalProfile: {
            ...student.globalProfile,
            ...data.globalProfile,
        },
        strengths: {
            ...student.strengths,
            ...data.strengths,
        },
        difficulties: {
            ...student.difficulties,
            ...data.difficulties,
        },
    };

    await updateStudent(student.id, updatedStudentData);
    setPageKey(Date.now()); // Change key to force re-fetch and re-render of the whole page
  };
  
  const getSuggestions = (category: string) => {
    return libraryItems.filter(item => item.category === category).map(item => item.text);
  }

  if (!student) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div key={pageKey}>
      <PageHeader
        title={`PPI de ${student.firstName} ${student.lastName}`}
        description="Profil global de l'élève et synthèse de son projet."
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" onClick={() => setIsImporting(true)}>
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
          </Button>
        </div>
      </PageHeader>
      
      <TextImporter
        open={isImporting}
        onOpenChange={setIsImporting}
        onImport={handleImport}
      />

      <div className="space-y-8">
        <AdministrativeForm student={student} classes={classes} />
        <GlobalProfileForm 
          student={student} 
          disabilityNaturesSuggestions={getSuggestions('disabilityNatures')}
          associatedDisordersSuggestions={getSuggestions('associatedDisorders')}
          medicalNeedsSuggestions={getSuggestions('medicalNeeds')}
          equipmentSuggestions={getSuggestions('equipment')}
          hobbiesSuggestions={getSuggestions('hobbies')}
        />
        <StrengthsForm
          student={student}
          academicSkillsSuggestions={getSuggestions('academicSkills')}
          cognitiveStrengthsSuggestions={getSuggestions('cognitiveStrengths')}
          socialSkillsSuggestions={getSuggestions('socialSkills')}
          exploitableInterestsSuggestions={getSuggestions('exploitableInterests')}
        />
        <DifficultiesForm
          student={student}
          cognitiveDifficultiesSuggestions={getSuggestions('cognitiveDifficulties')}
          schoolDifficultiesSuggestions={getSuggestions('schoolDifficulties')}
          motorDifficultiesSuggestions={getSuggestions('motorDifficulties')}
          socioEmotionalDifficultiesSuggestions={getSuggestions('socioEmotionalDifficulties')}
          disabilityConstraintsSuggestions={getSuggestions('disabilityConstraints')}
        />
        <NeedsForm
            student={student}
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
    </div>
  );
}
