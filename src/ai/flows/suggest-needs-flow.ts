
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
  input: { schema: SuggestNeedsInputSchema },
  output: { schema: SuggestNeedsOutputSchema },
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `
    Tu es un expert en ingénierie pédagogique.
    Ton rôle est de déduire les besoins éducatifs particuliers d'un élève à partir de son profil.

    PROFIL DE L'ÉLÈVE :
    - Points Forts (ce qu'il peut faire) : {{{json strengths}}}
    - Difficultés (ce qui le met en difficulté) : {{{json difficulties}}}

    INSTRUCTIONS :
    1.  **Analyse les difficultés** : Concentre-toi principalement sur la section "Difficultés". Chaque difficulté est un indicateur d'un besoin de compensation.
    2.  **Déduis les besoins** : Pour chaque difficulté identifiée, déduis le besoin correspondant. Par exemple, si l'élève a des "Difficultés en graphomotricité", un besoin pourrait être "Utiliser un ordinateur pour les tâches d'écriture longues". Si l'élève a des "Difficultés d'attention", un besoin pourrait être "Fractionner les tâches en étapes plus courtes".
    3.  **Utilise les points forts comme leviers** : Ne suggère pas un besoin qui est déjà comblé par un point fort. Par exemple, si l'élève a comme point fort "Communique bien à l'oral", ne suggère pas de besoin lié à la communication orale.
    4.  **Sois concret et actionnable** : Formule chaque besoin comme une action ou une ressource claire.
    5.  **Remplis les catégories pertinentes** : Propose 2 à 3 suggestions pertinentes pour chaque catégorie de besoin applicable. Si aucune suggestion ne te semble pertinente pour une catégorie, laisse la vide. Ne force pas les suggestions.
    6.  **Même si le profil est peu rempli, fais de ton mieux** pour proposer au moins quelques besoins de base logiques.
  `,
});

const suggestNeedsFlow = ai.defineFlow(
  {
    name: 'suggestNeedsFlow',
    inputSchema: SuggestNeedsInputSchema,
    outputSchema: SuggestNeedsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
