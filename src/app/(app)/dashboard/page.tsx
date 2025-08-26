
'use client';

import { useState, useEffect, Suspense } from 'react';
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
import { ArrowRight, FileText, Library, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getStudents } from '@/lib/students-repository';
import { getPpis } from '@/lib/ppi-repository';
import type { Student, Ppi } from '@/types';
import { getLibraryItemsCount } from '@/lib/library-repository';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [ppis, setPpis] = useState<Ppi[]>([]);
  const [libraryItemsCount, setLibraryItemsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsData = await getStudents();
        const ppisData = await getPpis();
        const libraryCountData = await getLibraryItemsCount();
        setStudents(studentsData);
        setPpis(ppisData);
        setLibraryItemsCount(libraryCountData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusVariant = {
    validated: 'default',
    draft: 'secondary',
    archived: 'outline',
    to_create: 'destructive',
  } as const;

  const statusText = {
    validated: 'Validé',
    draft: 'Brouillon',
    archived: 'Archivé',
    to_create: 'À créer',
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Tableau de bord" description="Ravi de vous revoir, voici un résumé de vos activités." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre total d'élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Gérés dans le système</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PPI Actifs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ppis.filter((p: Ppi) => p.status === 'draft' || p.status === 'validated').length}</div>
            <p className="text-xs text-muted-foreground">Pour tous les élèves</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éléments de la bibliothèque</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryItemsCount}</div>
            <p className="text-xs text-muted-foreground">Objectifs, besoins, etc. réutilisables.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mises à jour récentes des PPI</CardTitle>
                <CardDescription>Un journal des dernières modifications apportées aux PPI.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/ppi">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ppis.slice(0, 5).map((ppi: Ppi) => (
                  <TableRow key={ppi.id}>
                    <TableCell className="font-medium">{ppi.studentName}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[ppi.status]}>{statusText[ppi.status]}</Badge>
                    </TableCell>
                    <TableCell>{ppi.lastUpdate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/ppi/${ppi.studentId}`}>Voir le PPI</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
