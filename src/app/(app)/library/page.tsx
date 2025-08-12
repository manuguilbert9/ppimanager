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
import { getLibraryItems } from '@/lib/library-repository';
import { LibraryItem } from '@/types';
import { PlusCircle } from 'lucide-react';

const LibraryContent = ({ items }: { items: LibraryItem[] }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id} className="p-2 border-b">
        {item.text}
      </li>
    ))}
    {items.length === 0 && <p className="text-muted-foreground p-2">Aucun élément dans cette catégorie pour le moment.</p>}
  </ul>
);


export default async function LibraryPage() {
  const needs = await getLibraryItems('needs');
  const objectives = await getLibraryItems('objectives');
  const adaptations = await getLibraryItems('adaptations');
  const indicators = await getLibraryItems('indicators');

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
        <TabsList className="flex-wrap h-auto justify-start">
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
                <LibraryContent items={needs} />
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
                <LibraryContent items={objectives} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="adaptations">
            <Card>
              <CardHeader>
                <CardTitle>Moyens et Adaptations</CardTitle>
                <CardDescription>
                  Moyens et adaptations communs pouvant être assignés aux élèves.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LibraryContent items={adaptations} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="indicators">
            <Card>
              <CardHeader>
                <CardTitle>Indicateurs</CardTitle>
                <CardDescription>
                  Indicateurs communs pour le suivi des objectifs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LibraryContent items={indicators} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
