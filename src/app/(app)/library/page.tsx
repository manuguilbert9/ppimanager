import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        title="Gestion de la bibliothèque"
        description="Centralisez les éléments réutilisables pour une insertion rapide dans les PPI."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter à la bibliothèque
        </Button>
      </PageHeader>
      <Tabs defaultValue="needs">
        <TabsList>
          <TabsTrigger value="needs">Besoins</TabsTrigger>
          <TabsTrigger value="objectives">Objectifs</TabsTrigger>
          <TabsTrigger value="adaptations">Moyens et Adaptations</TabsTrigger>
          <TabsTrigger value="indicators">Indicateurs</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="needs">
            <Card>
              <CardHeader>
                <CardTitle>Besoins</CardTitle>
                <CardDescription>Besoins réutilisables pour les élèves.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>La liste des besoins sera affichée ici.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="objectives">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs</CardTitle>
                <CardDescription>
                  Objectifs communs pouvant être assignés aux élèves.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>La liste des objectifs sera affichée ici.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
