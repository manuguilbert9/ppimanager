import { getStudent } from "@/lib/students-repository";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalProfileForm } from "./global-profile";
import { StrengthsForm } from "./strengths-form";
import { getAllLibraryItems } from "@/lib/library-repository";
import { DifficultiesForm } from "./difficulties-form";
import { NeedsForm } from "./needs-form";
import { ObjectivesForm } from "./objectives-form";

export default async function PpiStudentPage({ params }: { params: { studentId: string } }) {
  const student = await getStudent(params.studentId);
  const libraryItems = await getAllLibraryItems();

  if (!student) {
    notFound();
  }
  
  const getSuggestions = (category: string) => {
    return libraryItems.filter(item => item.category === category).map(item => item.text);
  }

  return (
    <>
      <PageHeader
        title={`PPI de ${student.firstName} ${student.lastName}`}
        description="Profil global de l'élève et synthèse de son projet."
      >
        <div className="flex items-center gap-3">
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
      
      <div className="space-y-8">
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
        />
      </div>
    </>
  );
}
