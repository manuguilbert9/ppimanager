
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function performServerCheck() {
  try {
    return {
      status: 'error',
      message: 'Le panneau de débogage est temporairement désactivé.',
      details: 'Ce composant est désactivé pour permettre le chargement du reste de l\'application.',
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Une erreur inconnue est survenue.',
      details: error.details || 'Aucun détail supplémentaire.',
    };
  }
}

export function DebugPanel() {
  const [serverCheck, setServerCheck] = React.useState<any>(null);

  React.useEffect(() => {
    async function check() {
      const result = await performServerCheck();
      setServerCheck(result);
    }
    check();
  }, []);


  if (!serverCheck) return null;

  return (
    <Card className="mb-8 bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle>Panneau de Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Connexion Serveur</h3>
          {serverCheck.status.startsWith('success') ? (
            <p className="text-green-600">
              {serverCheck.message}
            </p>
          ) : (
            <p className="text-red-600">
              Échec de la connexion serveur à Firestore. Erreur: {serverCheck.message}
            </p>
          )}
        </div>
         {serverCheck.details && (
            <div>
                 <h3 className="font-semibold">Détails de l'erreur</h3>
                 <p className="text-red-600 text-xs font-mono bg-gray-100 p-2 rounded">{serverCheck.details}</p>
            </div>
         )}
      </CardContent>
    </Card>
  );
}

    