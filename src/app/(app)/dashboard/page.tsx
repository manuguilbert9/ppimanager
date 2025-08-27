
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ArrowRight, FileText, Users, Loader2, Group as GroupIcon, Calendar, Target } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getStudents } from '@/lib/students-repository';
import { getPpis } from '@/lib/ppi-repository';
import { getGroups } from '@/lib/groups-repository';
import type { Student, Ppi, Group, Objective } from '@/types';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PpiStatusChanger } from '../ppi/ppi-status-changer';

interface UpcomingObjective extends Objective {
    studentId: string;
    studentName: string;
    deadlineDate: Date;
}

const parseDeadline = (deadline?: string): Date | null => {
    if (!deadline) return null;
    try {
        return parse(deadline, 'dd/MM/yyyy', new Date());
    } catch (e) {
        return null;
    }
};

const UpcomingObjectives = ({ students }: { students: Student[] }) => {
    const upcomingObjectives = useMemo<Record<string, UpcomingObjective[]>>(() => {
        const objectives: UpcomingObjective[] = [];
        const now = new Date();

        students.forEach(student => {
            (student.objectives || []).forEach(obj => {
                const deadlineDate = parseDeadline(obj.deadline);
                if (deadlineDate && !obj.validationDate && deadlineDate >= now) {
                    objectives.push({
                        ...obj,
                        studentId: student.id,
                        studentName: `${student.firstName} ${student.lastName}`,
                        deadlineDate,
                    });
                }
            });
        });

        objectives.sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());

        return objectives.reduce((acc, obj) => {
            const monthKey = format(obj.deadlineDate, 'MMMM yyyy', { locale: fr });
            const capitalizedMonthKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
            if (!acc[capitalizedMonthKey]) {
                acc[capitalizedMonthKey] = [];
            }
            acc[capitalizedMonthKey].push(obj);
            return acc;
        }, {} as Record<string, UpcomingObjective[]>);

    }, [students]);

    const monthKeys = Object.keys(upcomingObjectives);
    
    if (monthKeys.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Objectifs à venir</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        <Target className="mx-auto h-12 w-12 mb-4" />
                        <p>Aucun objectif avec une échéance future n'a été défini.</p>
                        <p className="text-xs mt-2">
                           Définissez des objectifs dans les PPI de vos élèves.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Échéances à venir</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthKeys.map(month => (
                    <Card key={month}>
                        <CardHeader>
                            <CardTitle className="text-lg">{month}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {upcomingObjectives[month].map(obj => (
                                    <li key={obj.id} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-bold">{format(obj.deadlineDate, 'dd', { locale: fr })}</span>
                                            <span className="text-xs text-muted-foreground">{format(obj.deadlineDate, 'MMM', { locale: fr })}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold leading-tight">{obj.title}</p>
                                            <Link href={`/ppi/${obj.studentId}`} className="text-sm text-muted-foreground hover:underline">{obj.studentName}</Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};


export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [ppis, setPpis] = useState<Ppi[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsData, ppisData, groupsData] = await Promise.all([
        getStudents(),
        getPpis(),
        getGroups()
      ]);
      setStudents(studentsData);
      setPpis(ppisData);
      setGroups(groupsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
       <div className="space-y-8">
            <UpcomingObjectives students={students} />

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
                    <p className="text-xs text-muted-foreground">En statut "Brouillon" ou "Validé".</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Groupes de travail</CardTitle>
                    <GroupIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{groups.length}</div>
                    <p className="text-xs text-muted-foreground">Groupes actifs créés.</p>
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
                            <PpiStatusChanger ppi={ppi} onStatusChanged={fetchData} />
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
       </div>
    </>
  );
}
