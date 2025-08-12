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
  const disabilityNatures = await getLibraryItems('disabilityNatures');
  const associatedDisorders = await getLibraryItems('associatedDisorders');
  const equipments = await getLibraryItems('equipments');
  const hobbies = await getLibraryItems('hobbies');
  const medicalNeeds = await getLibraryItems('medicalNeeds');

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
          <TabsTrigger value="disabilityNatures">Diagnostics</TabsTrigger>
          <TabsTrigger value="associatedDisorders">Troubles associés</TabsTrigger>
          <TabsTrigger value="equipments">Équipements</TabsTrigger>
          <TabsTrigger value="hobbies">Centres d'intérêt</TabsTrigger>
          <TabsTrigger value="medicalNeeds">Besoins médicaux</TabsTrigger>
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
           <TabsContent value="disabilityNatures">
            <Card>
              <CardHeader>
                <CardTitle>Diagnostics</CardTitle>
                <CardDescription>
                  Liste des diagnostics principaux saisis pour les élèves.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LibraryContent items={disabilityNatures} />
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="associatedDisorders">
            <Card>
              <CardHeader>
                <CardTitle>Troubles associés</CardTitle>
                <CardDescription>
                  Liste des troubles associés saisis pour les élèves.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LibraryContent items={associatedDisorders} />
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="equipments">
            <Card>
              <CardHeader>
                <CardTitle>Équipements et appareillages</CardTitle>
                <CardDescription>
                  Liste des équipements saisis pour les élèves.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LibraryContent items={equipments} />
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="hobbies">
            <Card>
              <CardHeader>
                <CardTitle>Centres d'intérêt</CardTitle>
                <CardDescription>
                  Liste des centres d'intérêt saisis pour les élèves.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LibraryContent items={hobbies} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="medicalNeeds">
            <Card>
              <CardHeader>
                <CardTitle>Besoins médicaux</CardTitle>
                <CardDescription>
                  Liste des besoins médicaux saisis pour les élèves.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LibraryContent items={medicalNeeds} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
