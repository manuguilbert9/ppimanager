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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getPpis } from '@/lib/ppi-repository';
import type { Ppi } from '@/types';
import { PpiStatusChanger } from './ppi-status-changer';
import { ExportPpiButton } from './export-ppi-button';

const PpiSection = ({
  title,
  description,
  ppis,
}: {
  title: string;
  description: string;
  ppis: Ppi[];
}) => {
  if (ppis.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
            {ppis.map((ppi: Ppi) => (
              <TableRow key={ppi.id}>
                <TableCell className="font-medium">{ppi.studentName}</TableCell>
                <TableCell>
                  <PpiStatusChanger ppi={ppi} />
                </TableCell>
                <TableCell>{ppi.lastUpdate}</TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/ppi/${ppi.studentId}`}>Voir le PPI</Link>
                        </Button>
                        {ppi.status === 'validated' && <ExportPpiButton studentId={ppi.studentId} />}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default async function PpiPage() {
  const ppis = await getPpis();

  const draftPpis = ppis.filter((p) => p.status === 'draft');
  const validatedPpis = ppis.filter((p) => p.status === 'validated');
  const archivedPpis = ppis.filter((p) => p.status === 'archived');

  return (
    <>
      <PageHeader
        title="Gestion des Projets Pédagogiques Individualisés (PPI)"
        description="Créez, mettez à jour et gérez tous les PPI des élèves."
      />
      <div className="space-y-8">
        <PpiSection
          title="Brouillons"
          description="Les PPI en cours de rédaction ou de modification."
          ppis={draftPpis}
        />
        <PpiSection
          title="Validés"
          description="Les PPI validés et actuellement en application."
          ppis={validatedPpis}
        />
        <PpiSection
          title="Archivés"
          description="Les PPI des années précédentes ou des élèves sortis."
          ppis={archivedPpis}
        />
      </div>
    </>
  );
}
