'use server';

/**
 * @fileOverview Suggests adaptations for a learning objective.
 *
 * - suggestAdaptations - A function that generates adaptation suggestions.
 * - SuggestAdaptationsInput - The input type for the suggestAdaptations function.
 * - SuggestAdaptationsOutput - The return type for the suggestAdaptations function.
 */

import { ai } from '@/ai/genkit';
import { getLibraryItems } from '@/lib/library-repository';
import { z } from 'zod';

const SuggestAdaptationsInputSchema = z.object({
  objectiveTitle: z.string().describe("L'intitulé de l'objectif pour lequel suggérer des adaptations."),
});
export type SuggestAdaptationsInput = z.infer<typeof SuggestAdaptationsInputSchema>;

const SuggestAdaptationsOutputSchema = z.object({
  adaptations: z.array(z.string()).describe("Une liste de 3 à 5 moyens et adaptations pertinents pour l'objectif."),
});
export type SuggestAdaptationsOutput = z.infer<typeof SuggestAdaptationsOutputSchema>;

export async function suggestAdaptations(input: SuggestAdaptationsInput): Promise<SuggestAdaptationsOutput> {
  return suggestAdaptationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAdaptationsPrompt',
  input: { schema: z.object({
    objectiveTitle: SuggestAdaptationsInputSchema.shape.objectiveTitle,
    existingAdaptations: z.array(z.string()).describe('Une liste d\'adaptations existantes pour inspiration.')
  }) },
  output: { schema: SuggestAdaptationsOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique.
    Pour l'objectif suivant : "{{{objectiveTitle}}}"

    Propose 3 à 5 moyens et adaptations pédagogiques très pertinents et concrets pour aider l'élève à atteindre cet objectif.

    Tu peux t'inspirer de la liste d'adaptations existantes suivante si elles sont pertinentes, mais n'hésite pas à en créer de nouvelles, plus spécifiques, si nécessaire.
    Liste d'inspiration : {{{existingAdaptations}}}

    Ne propose que des adaptations directement liées à l'objectif.
  `,
});

const suggestAdaptationsFlow = ai.defineFlow(
  {
    name: 'suggestAdaptationsFlow',
    inputSchema: SuggestAdaptationsInputSchema,
    outputSchema: SuggestAdaptationsOutputSchema,
  },
  async (input) => {
    const adaptations = await getLibraryItems('adaptations');
    const existingAdaptations = adaptations.map(item => item.text);
    
    const { output } = await prompt({
      objectiveTitle: input.objectiveTitle,
      existingAdaptations: existingAdaptations,
    });
    return output!;
  }
);
