
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStudents } from '@/lib/students-repository';
import type { Student, Classe } from '@/types';
import { AddStudentForm } from './add-student-form';
import { StudentActions } from './student-actions';
import { getClasses } from '@/lib/classes-repository';
import { Loader2 } from 'lucide-react';
import { useDataFetching } from '@/hooks/use-data-fetching';

export default function StudentsPage() {
  const { data: students, loading: loadingStudents, refresh: refreshStudents } = useDataFetching(getStudents);
  const { data: classes, loading: loadingClasses } = useDataFetching(getClasses);
  
  const loading = loadingStudents || loadingClasses;

  const statusVariant = {
    validated: 'default',
    draft: 'secondary',
    archived: 'outline',
  } as const;

  const statusText = {
    validated: 'Validé',
    draft: 'Brouillon',
    archived: 'Archivé',
  };

  const getAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    
    const parts = birthDate.split('/');
    let formattedDate = birthDate;
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const birth = new Date(formattedDate);
    if (isNaN(birth.getTime())) {
        return 'N/A';
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) ? 'N/A' : age;
  }

  return (
    <>
      <PageHeader
        title="Gestion des élèves"
        description="Gérez les profils des élèves et leurs PPI associés."
      >
        <AddStudentForm classes={classes} onStudentAdded={refreshStudents} />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Liste des élèves</CardTitle>
          <CardDescription>
            Une liste de tous les élèves du système.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Statut PPI</TableHead>
                  <TableHead>Fin notif. MDPH</TableHead>
                  <TableHead>Dernière mise à jour du PPI</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student: Student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
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
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell>{getAge(student.birthDate)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[student.ppiStatus]}>
                        {statusText[student.ppiStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.mdphNotificationExpiration}</TableCell>
                    <TableCell>{student.lastUpdate}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <StudentActions student={student} classes={classes} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
