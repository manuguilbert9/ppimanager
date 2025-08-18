
'use client';

import { useState, useMemo } from 'react';
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
import { orderBy } from 'lodash';
import { SortableHeader, SortDirection } from './sortable-header';

type SortKey = 'name' | 'className' | 'age' | 'ppiStatus' | 'mdphNotificationExpiration' | 'lastUpdate';

const getAge = (birthDate?: string): number | null => {
    if (!birthDate) return null;
    
    const parts = birthDate.split('/');
    let formattedDate = birthDate;
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const birth = new Date(formattedDate);
    if (isNaN(birth.getTime())) {
        return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) ? null : age;
};

const parseDate = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(p => parseInt(p, 10));
    // Note: month is 0-indexed in JS Date
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date.getTime();
};

export default function StudentsPage() {
  const { data: students, loading: loadingStudents, refresh: refreshStudents } = useDataFetching(getStudents);
  const { data: classes, loading: loadingClasses } = useDataFetching(getClasses);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });

  const loading = loadingStudents || loadingClasses;

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    if (loading || students.length === 0) return [];

    let data = [...students];

    const sortKeys: (string | ((student: Student) => any))[] = [];
    const sortOrders: ('asc' | 'desc')[] = [sortConfig.direction];

    switch (sortConfig.key) {
        case 'name':
            sortKeys.push('lastName', 'firstName');
            sortOrders.push('asc', 'asc');
            break;
        case 'className':
            sortKeys.push('className', 'lastName', 'firstName');
            sortOrders.push(sortConfig.direction, 'asc', 'asc');
            break;
        case 'age':
            sortKeys.push(student => getAge(student.birthDate));
            break;
        case 'mdphNotificationExpiration':
            sortKeys.push(student => parseDate(student.mdphNotificationExpiration) || 0);
            break;
        case 'lastUpdate':
            sortKeys.push('lastUpdateTimestamp');
            break;
        default:
            sortKeys.push(sortConfig.key);
            break;
    }

    return orderBy(data, sortKeys, sortOrders);
  }, [students, sortConfig, loading]);

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
                  <TableHead>
                    <SortableHeader
                        label="Nom"
                        sortKey="name"
                        currentSort={sortConfig}
                        onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                        label="Classe"
                        sortKey="className"
                        currentSort={sortConfig}
                        onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                        label="Âge"
                        sortKey="age"
                        currentSort={sortConfig}
                        onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                        label="Statut PPI"
                        sortKey="ppiStatus"
                        currentSort={sortConfig}
                        onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                        label="Fin notif. MDPH"
                        sortKey="mdphNotificationExpiration"
                        currentSort={sortConfig}
                        onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                        label="Dernière mise à jour"
                        sortKey="lastUpdate"
                        currentSort={sortConfig}
                        onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student: Student) => (
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
                    <TableCell>{getAge(student.birthDate) ?? 'N/A'}</TableCell>
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
