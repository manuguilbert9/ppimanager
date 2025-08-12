import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PpiPage() {
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
            Cette section affichera une liste de tous les PPI. L'éditeur PPI complet sera disponible à l'adresse `/ppi/[id]`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>L'implémentation de la liste des PPI est en attente.</p>
        </CardContent>
      </Card>
    </>
  );
}
