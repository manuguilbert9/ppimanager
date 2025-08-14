
'use server';

/**
 * @fileOverview Analyzes raw text from an educational document and extracts structured data for a PPI.
 *
 * - extractDataFromText - A function that parses text and returns structured data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ExtractedDataSchema } from '@/types/schemas';
import type { ExtractedData } from '@/types/schemas';


export type { ExtractedData };

export async function extractDataFromText(text: string): Promise<ExtractedData> {
  return extractDataFromTextFlow(text);
}

const prompt = ai.definePrompt({
  name: 'extractDataFromTextPrompt',
  input: { schema: z.string() },
  output: { schema: ExtractedDataSchema },
  prompt: `
    Tu es un expert en analyse de documents du domaine de l'éducation spécialisée.
    Ton rôle est d'analyser le texte brut fourni ci-dessous et d'extraire les informations pour remplir la structure JSON demandée.

    INSTRUCTIONS IMPORTANTES :
    1.  **Identification des sections** : Le texte est structuré avec des titres (ex: "Informations Administratives", "Profil Global", "Points d'appuis", "Difficultés"). Identifie correctement à quelle section appartient chaque information.
    2.  **Gestion des listes** : Sous chaque titre, il peut y avoir des listes d'éléments. Regroupe toutes les lignes de texte sous un titre dans un tableau JSON, même si elles ne commencent pas par un tiret. Par exemple, sous "Compétences acquises", toutes les lignes suivantes font partie de la liste.
    3.  **Catégorisation précise** : Fais particulièrement attention à placer les éléments dans les bonnes sous-catégories. Par exemple, une difficulté liée à la "lecture" doit aller dans "schoolDifficulties", tandis qu'un trouble de l'"attention" va dans "cognitiveDifficulties". Utilise les descriptions du schéma JSON de sortie pour t'aider à décider.
    4.  **Contacts familiaux** : Extrais les informations de contact de la section "Famille / Représentants légaux".
    5.  **Champs vides** : Si une information ou une section n'est pas présente dans le texte, laisse le champ correspondant vide ou le tableau vide dans le JSON de sortie. N'invente aucune information.

    Analyse le texte suivant et retourne les données au format JSON demandé.

    TEXTE À ANALYSER :
    {{{input}}}
  `,
});

const extractDataFromTextFlow = ai.defineFlow(
  {
    name: 'extractDataFromTextFlow',
    inputSchema: z.string(),
    outputSchema: ExtractedDataSchema,
  },
  async (text) => {
    const { output } = await prompt(text);
    return output!;
  }
);
