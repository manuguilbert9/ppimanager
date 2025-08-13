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
    Tu es un expert en analyse de documents administratifs du domaine de l'éducation spécialisée, comme les GevaSco.
    Ton rôle est d'analyser le texte brut fourni ci-dessous et d'en extraire les informations pertinentes pour remplir une structure JSON.
    Le texte peut être mal formaté ou incomplet. Fais de ton mieux pour interpréter le contenu de manière sémantique.

    Voici les règles à suivre :
    1.  Identifie les sections principales comme "Informations Administratives", "Profil Global", "Points d'appuis", "Difficultés".
    2.  Pour les listes (comme "Difficultés cognitives" ou "Points d'appuis"), regroupe toutes les lignes de texte sous un titre dans un tableau de chaînes de caractères. Ne te fie pas à la présence de tirets.
    3.  Pour les contacts, extrais les informations pour chaque personne.
    4.  Si une information n'est pas présente dans le texte, laisse simplement le champ correspondant vide dans le JSON de sortie, sans générer d'erreur.
    5.  Fais particulièrement attention à bien catégoriser les éléments des listes dans les bonnes sections (ex: ce qui relève des "difficultés cognitives" vs "difficultés scolaires").

    Analyse le texte suivant et retourne un objet JSON structuré :

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
