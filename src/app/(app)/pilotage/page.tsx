
'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getStudents } from '@/lib/students-repository';
import type { Student, Objective } from '@/types';
import { Loader2, User, Calendar } from 'lucide-react';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ObjectiveGroup {
  objectiveTitle: string;
  students: {
    id: string;
    name: string;
    deadline?: string;
  }[];
}

export default function PilotagePage() {
  const { data: students, loading } = useDataFetching(getStudents);

  const objectiveGroups = useMemo(() => {
    if (!students) return [];

    const groups: { [title: string]: ObjectiveGroup['students'] } = {};

    students.forEach((student) => {
      if (student.objectives && student.ppiStatus !== 'archived') {
        student.objectives.forEach((objective) => {
          if (objective.title && !objective.validationDate) { // Only active objectives
            if (!groups[objective.title]) {
              groups[objective.title] = [];
            }
            groups[objective.title].push({
              id: student.id,
              name: `${student.firstName} ${student.lastName}`,
              deadline: objective.deadline,
            });
          }
        });
      }
    });

    return Object.entries(groups).map(([title, studentList]) => ({
      objectiveTitle: title,
      students: studentList,
    }));
  }, [students]);


  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Pilotage des apprentissages"
        description="Regroupez les élèves par objectifs communs pour organiser des ateliers de travail."
      />
      
      {objectiveGroups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucun objectif commun trouvé parmi les élèves actifs pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objectiveGroups.map((group) => (
            <Card key={group.objectiveTitle}>
              <CardHeader>
                <CardTitle className="text-lg">{group.objectiveTitle}</CardTitle>
                <CardDescription>
                  {group.students.length} élève(s) travaillent sur cet objectif.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {group.students.map((student) => (
                    <li key={student.id} className="flex flex-col p-3 bg-background rounded-md border">
                        <div className="flex items-center gap-2 font-medium">
                            <User className="h-4 w-4 text-primary" />
                            <Link href={`/ppi/${student.id}`} className="hover:underline">
                                {student.name}
                            </Link>
                        </div>
                        {student.deadline && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 ml-1">
                                <Calendar className="h-4 w-4" />
                                <span>Échéance: {student.deadline}</span>
                            </div>
                        )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
