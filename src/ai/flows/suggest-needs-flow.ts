
'use server';

/**
 * @fileOverview Suggests special educational needs for a student based on their profile.
 *
 * - suggestNeeds - A function that generates need suggestions.
 * - SuggestNeedsInput - The input type for the suggestNeeds function.
 * - SuggestNeedsOutput - The return type for the suggestNeeds function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getLibraryItems } from '@/lib/library-repository';
import type { Strengths, Difficulties } from '@/types';

export const SuggestNeedsInputSchema = z.object({
  strengths: z.object({
    academicSkills: z.array(z.string()).optional(),
    cognitiveStrengths: z.array(z.string()).optional(),
    socialSkills: z.array(z.string()).optional(),
    exploitableInterests: z.array(z.string()).optional(),
  }).optional(),
  difficulties: z.object({
    cognitiveDifficulties: z.array(z.string()).optional(),
    schoolDifficulties: z.array(z.string()).optional(),
    motorDifficulties: z.array(z.string()).optional(),
    socioEmotionalDifficulties: z.array(z.string()).optional(),
    disabilityConstraints: z.array(z.string()).optional(),
  }).optional(),
});
export type SuggestNeedsInput = z.infer<typeof SuggestNeedsInputSchema>;

const NeedsSchema = z.object({
    pedagogicalAccommodations: z.array(z.string()).optional().describe("Les aménagements pédagogiques nécessaires (ex: Agrandir les textes, temps majoré)."),
    humanAssistance: z.array(z.string()).optional().describe("Le besoin d'une aide humaine (ex: AESH, tuteur)."),
    compensatoryTools: z.array(z.string()).optional().describe("Les outils de compensation à mettre en place (ex: ordinateur, logiciel de synthèse vocale)."),
    specialEducationalApproach: z.array(z.string()).optional().describe("Les approches éducatives spécifiques recommandées (ex: ABA, TEACCH)."),
    complementaryCare: z.array(z.string()).optional().describe("Les soins ou rééducations complémentaires (ex: orthophonie, psychomotricité)."),
});

export const SuggestNeedsOutputSchema = NeedsSchema;
export type SuggestNeedsOutput = z.infer<typeof SuggestNeedsOutputSchema>;

export async function suggestNeeds(input: SuggestNeedsInput): Promise<SuggestNeedsOutput> {
  return suggestNeedsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNeedsPrompt',
  input: { schema: z.object({
    strengths: SuggestNeedsInputSchema.shape.strengths,
    difficulties: SuggestNeedsInputSchema.shape.difficulties,
    library: z.object({
        pedagogicalAccommodations: z.array(z.string()),
        humanAssistance: z.array(z.string()),
        compensatoryTools: z.array(z.string()),
        specialEducationalApproach: z.array(z.string()),
        complementaryCare: z.array(z.string()),
    }).describe("Bibliothèque d'éléments existants pour inspiration.")
  }) },
  output: { schema: SuggestNeedsOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique.
    En te basant sur le profil de l'élève ci-dessous, suggère une liste pertinente de besoins éducatifs particuliers.

    PROFIL DE L'ÉLÈVE :
    - Points Forts : {{{json strengths}}}
    - Difficultés : {{{json difficulties}}}

    INSTRUCTIONS :
    1. Analyse les difficultés de l'élève pour déterminer les besoins de compensation nécessaires.
    2. Pour chaque catégorie de besoin ci-dessous, propose 2 à 3 suggestions pertinentes et concrètes.
    3. Inspire-toi de la bibliothèque fournie, mais n'hésite pas à formuler de nouveaux besoins si c'est plus adapté.
    4. NE SUGGÈRE PAS de besoins qui sont déjà comblés par les points forts de l'élève.
    5. Formule les besoins sous forme d'actions ou de ressources claires.

    Bibliothèque d'inspiration :
    - Aménagements pédagogiques: {{{json library.pedagogicalAccommodations}}}
    - Aide humaine: {{{json library.humanAssistance}}}
    - Outils de compensation: {{{json library.compensatoryTools}}}
    - Approche éducative: {{{json library.specialEducationalApproach}}}
    - Soins et rééducations: {{{json library.complementaryCare}}}
  `,
});

const suggestNeedsFlow = ai.defineFlow(
  {
    name: 'suggestNeedsFlow',
    inputSchema: SuggestNeedsInputSchema,
    outputSchema: SuggestNeedsOutputSchema,
  },
  async (input) => {
    const [
        pedagogicalAccommodations,
        humanAssistance,
        compensatoryTools,
        specialEducationalApproach,
        complementaryCare,
    ] = await Promise.all([
        getLibraryItems('pedagogicalAccommodations').then(items => items.map(i => i.text)),
        getLibraryItems('humanAssistance').then(items => items.map(i => i.text)),
        getLibraryItems('compensatoryTools').then(items => items.map(i => i.text)),
        getLibraryItems('specialEducationalApproach').then(items => items.map(i => i.text)),
        getLibraryItems('complementaryCare').then(items => items.map(i => i.text)),
    ]);

    const { output } = await prompt({
        ...input,
        library: {
            pedagogicalAccommodations,
            humanAssistance,
            compensatoryTools,
            specialEducationalApproach,
            complementaryCare,
        }
    });

    return output!;
  }
);
