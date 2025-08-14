
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
    Tu es un expert en analyse de documents administratifs du domaine de l'éducation spécialisée.
    Ton unique rôle est d'analyser le texte fourni ci-dessous et d'en extraire les informations pertinentes pour remplir la structure JSON demandée en sortie.
    Le texte peut être mal formaté ou incomplet. Fais de ton mieux pour interpréter le contenu de manière sémantique.

    Si une information n'est pas présente dans le texte, laisse simplement le champ correspondant vide dans le JSON de sortie, sans générer d'erreur.

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
