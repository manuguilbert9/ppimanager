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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getPpis } from '@/lib/ppi-repository';
import type { Ppi } from '@/types';

export default async function PpiPage() {
  const ppis = await getPpis();

  const statusVariant = {
    validated: 'default',
    draft: 'secondary',
    archived: 'outline',
  } as const;

  const statusText = {
    validated: 'Validé',
    draft: 'Brouillon',
    archived: 'Archivé',
  }

  return (
    <>
      <PageHeader
        title="Gestion des PPI"
        description="Créez, mettez à jour et gérez tous les PPI des élèves."
      />
      <Card>
        <CardHeader>
          <CardTitle>Liste des PPI</CardTitle>
          <CardDescription>
            Cette section affichera une liste de tous les PPI.
          </CardDescription>
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
                      <Badge variant={statusVariant[ppi.status]}>{statusText[ppi.status]}</Badge>
                    </TableCell>
                    <TableCell>{ppi.lastUpdate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/ppi/${ppi.id}`}>Voir le PPI</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </>
  );
}
