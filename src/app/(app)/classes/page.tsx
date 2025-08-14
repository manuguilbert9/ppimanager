
'use client';

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
import { getClasses } from '@/lib/classes-repository';
import type { Classe } from '@/types';
import { AddClasseForm } from './add-classe-form';
import { ClasseActions } from './classe-actions';
import { Loader2 } from 'lucide-react';
import { useDataFetching } from '@/hooks/use-data-fetching';

export default function ClassesPage() {
  const { data: classes, loading, refresh } = useDataFetching(getClasses);

  return (
    <>
      <PageHeader
        title="Gestion des classes"
        description="Gérez les classes de votre établissement."
      >
        <AddClasseForm onClasseAdded={refresh} />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Liste des classes</CardTitle>
          <CardDescription>
            Une liste de toutes les classes de votre établissement.
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
                  <TableHead>Enseignant</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classe: Classe) => (
                  <TableRow key={classe.id}>
                    <TableCell className="font-medium">
                        {classe.name}
                    </TableCell>
                    <TableCell>
                        {classe.teacherName}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <ClasseActions classe={classe} />
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
