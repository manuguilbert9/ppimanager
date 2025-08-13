'use server';

/**
 * @fileOverview Suggests educational needs for a student based on their profile.
 *
 * - suggestNeeds - A function that generates needs suggestions.
 * - SuggestNeedsInput - The input type for the suggestNeeds function.
 * - SuggestNeedsOutput - The return type for the suggestNeeds function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Strengths, Difficulties } from '@/types';

const SuggestNeedsInputSchema = z.object({
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

const SuggestNeedsOutputSchema = z.object({
  pedagogicalAccommodations: z.array(z.string()).describe("Suggestions d'aménagements pédagogiques."),
  humanAssistance: z.array(z.string()).describe("Suggestions d'aide humaine."),
  compensatoryTools: z.array(z.string()).describe("Suggestions d'outils de compensation."),
  specialEducationalApproach: z.array(z.string()).describe("Suggestions d'approches éducatives particulières."),
  complementaryCare: z.array(z.string()).describe("Suggestions de soins ou rééducations complémentaires."),
});
export type SuggestNeedsOutput = z.infer<typeof SuggestNeedsOutputSchema>;

export async function suggestNeeds(input: SuggestNeedsInput): Promise<SuggestNeedsOutput> {
  return suggestNeedsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNeedsPrompt',
  input: { schema: SuggestNeedsInputSchema },
  output: { schema: SuggestNeedsOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique spécialisé dans l'éducation inclusive.
    Ton rôle est de déterminer les besoins éducatifs particuliers d'un élève en te basant sur ses difficultés et ses points forts.

    Voici le profil de l'élève :

    POINTS FORTS (ce sont des leviers potentiels) :
    - Compétences académiques : {{{strengths.academicSkills}}}
    - Forces cognitives : {{{strengths.cognitiveStrengths}}}
    - Habiletés sociales : {{{strengths.socialSkills}}}
    - Intérêts : {{{strengths.exploitableInterests}}}

    DIFFICULTÉS (ce sont les obstacles à surmonter) :
    - Cognitives : {{{difficulties.cognitiveDifficulties}}}
    - Scolaires : {{{difficulties.schoolDifficulties}}}
    - Motrices : {{{difficulties.motorDifficulties}}}
    - Socio-émotionnelles : {{{difficulties.socioEmotionalDifficulties}}}
    - Contraintes du handicap : {{{difficulties.disabilityConstraints}}}

    INSTRUCTION :
    En te basant principalement sur les DIFFICULTÉS listées, et en considérant les POINTS FORTS comme des moyens pour aider l'élève, propose des listes de besoins concrets et spécifiques pour chaque catégorie ci-dessous.
    Sois très précis et formule chaque besoin comme une action ou un outil directement utilisable.
    Si aucune difficulté ne justifie un besoin dans une catégorie, tu peux laisser la liste vide.

    - Aménagements pédagogiques : Quels aménagements des supports, des évaluations, de l'environnement sont nécessaires ?
    - Aide humaine : Quel type d'aide humaine (AESH, tuteur, enseignant) est requis et pour quelles tâches ?
    - Outils de compensation : Quels outils matériels ou logiciels permettraient de contourner les difficultés ?
    - Approche éducative particulière : Quelles méthodes pédagogiques spécifiques (ABA, TEACCH, gestion mentale...) seraient bénéfiques ?
    - Soins ou rééducations complémentaires : Quels suivis (orthophonie, psychomotricité...) sont nécessaires pour soutenir les apprentissages ?

    Génère 3 à 5 suggestions pertinentes par catégorie si possible.
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
