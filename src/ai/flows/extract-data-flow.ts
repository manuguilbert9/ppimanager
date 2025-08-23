
'use server';

/**
 * @fileOverview Extracts structured data from a raw text about a student.
 * - extractDataFromText - A function that performs the extraction.
 * - ExtractDataInput - The input type for the function.
 * - ExtractDataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ExtractedDataSchema } from '@/types/schemas';

const ExtractDataInputSchema = z.object({
  text: z.string().describe("Le texte brut à analyser, pouvant provenir d'un GEVASco, d'un compte-rendu, etc."),
});
export type ExtractDataInput = z.infer<typeof ExtractDataInputSchema>;

export type ExtractDataOutput = z.infer<typeof ExtractedDataSchema>;

export async function extractDataFromText(input: ExtractDataInput): Promise<ExtractDataOutput> {
  return extractDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDataPrompt',
  input: { schema: ExtractDataInputSchema },
  output: { schema: ExtractedDataSchema },
  prompt: `
    Tu es un expert dans l'analyse de documents liés à l'éducation spécialisée (GEVASco, comptes-rendus, etc.).
    Ta mission est d'extraire de manière structurée les informations du texte fourni ci-dessous.

    TEXTE À ANALYSER :
    ---
    {{{text}}}
    ---

    INSTRUCTIONS D'EXTRACTION :
    -   Analyse attentivement le texte pour identifier chaque information pertinente.
    -   Ne déduis que les informations explicitement présentes. Si une information n'est pas dans le texte, ne l'invente pas et laisse le champ vide.
    -   Pour les listes (comme les difficultés, les points forts, etc.), extrais chaque point comme un élément distinct dans le tableau correspondant.
    -   Pour les contacts familiaux, extrais le nom, le titre (M., Mme), le téléphone et l'email si disponibles.
    -   Fais particulièrement attention à bien séparer les points forts (ce que l'élève réussit) des difficultés (ce qui pose problème).
    -   Remplis les champs de sortie avec les données extraites.
  `,
});


const extractDataFlow = ai.defineFlow(
  {
    name: 'extractDataFlow',
    inputSchema: ExtractDataInputSchema,
    outputSchema: ExtractedDataSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
