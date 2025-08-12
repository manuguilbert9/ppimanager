import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Gérez les paramètres de l'application, les rôles des utilisateurs et les préférences."
      />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="roles">Gestion des rôles</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Votre profil</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Le formulaire de paramètres du profil sera ici.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des rôles</CardTitle>
                <CardDescription>
                  Gérez les rôles et les autorisations des utilisateurs (administrateur, coordinateur, enseignant, etc.).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Le tableau de gestion des utilisateurs et des rôles sera ici.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
