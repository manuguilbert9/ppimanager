'use server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dbAdmin } from '@/lib/firebase-admin';

async function performServerCheck() {
  try {
    // Attempt to get a list of collections. This is a basic, root-level read operation.
    const collections = await dbAdmin.listCollections();
    const collectionIds = collections.map(c => c.id);
    
    if (collectionIds.length > 0) {
        return {
            status: 'success',
            message: `Connexion réussie ! Collections trouvées : ${collectionIds.join(', ')}`,
            data: collectionIds.length,
        };
    } else {
        return {
            status: 'success_empty',
            message: 'Connexion réussie, mais aucune collection trouvée. La base de données est peut-être vide.',
            data: 0,
        };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Une erreur inconnue est survenue.',
      details: error.details || 'Aucun détail supplémentaire.',
    };
  }
}

export async function DebugPanel() {
  const serverCheck = await performServerCheck();

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
