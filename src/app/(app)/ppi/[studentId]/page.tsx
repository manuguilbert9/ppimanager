import { getStudent } from "@/lib/students-repository";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalProfileForm } from "./global-profile";

export default async function PpiStudentPage({ params }: { params: { studentId: string } }) {
  const student = await getStudent(params.studentId);

  if (!student) {
    notFound();
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
        <GlobalProfileForm student={student} />
      </div>
    </>
  );
}
