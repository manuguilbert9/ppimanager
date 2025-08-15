
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getGroups, deleteGroup } from '@/lib/groups-repository';
import type { Group } from '@/types';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { Loader2, Trash2, FileDown, User, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { generateGroupDocx } from '@/lib/group-docx-exporter';

export default function GroupsPage() {
  const { data: groups, loading, refresh } = useDataFetching(getGroups);
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteGroup(id);
      toast({
        title: 'Groupe supprimé',
        description: 'Le groupe de travail a été supprimé avec succès.',
      });
      refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du groupe.',
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  const handleExport = async (group: Group) => {
    setExportingId(group.id);
    try {
        const blob = await generateGroupDocx(group);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Groupe_${group.groupTitle.replace(/ /g, "_")}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: "Erreur lors de l'exportation",
            description: "Une erreur est survenue. Veuillez réessayer.",
        });
    } finally {
        setExportingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Groupes de travail sauvegardés"
        description="Gérez et exportez les groupes de travail créés à partir des suggestions de l'IA."
      />

      {loading ? (
        <div className="flex h-full w-full items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Aucun groupe de travail sauvegardé pour le moment.</p>
            <Button asChild variant="link">
              <Link href="/pilotage">Analyser les objectifs pour créer des groupes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre du groupe</TableHead>
                  <TableHead>Nombre d'élèves</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => {
                  const isDeleting = deletingId === group.id;
                  const isExporting = exportingId === group.id;
                  return (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        <Popover>
                            <PopoverTrigger asChild>
                                <span className="cursor-pointer hover:underline">{group.groupTitle}</span>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">{group.groupTitle}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {group.rationale}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="font-medium leading-none text-sm">Élèves</h5>
                                        <ul className="space-y-2">
                                            {group.students.map(student => (
                                                <li key={student.id} className="text-sm">
                                                    <div className="font-semibold flex items-center gap-1.5">
                                                        <User className="h-3 w-3" /> {student.name}
                                                    </div>
                                                    <p className="pl-5 text-muted-foreground text-xs italic">
                                                        {student.objectiveTitle}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>{group.students.length}</TableCell>
                      <TableCell>{group.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport(group)}
                                disabled={isExporting}
                            >
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                Exporter
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDelete(group.id)}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
