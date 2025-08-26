
'use server';

/**
 * @fileOverview Suggests learning objectives for a student based on their profile.
 *
 * - suggestObjectives - A function that generates objective suggestions.
 * - SuggestObjectivesInput - The input type for the suggestObjectives function.
 * - SuggestObjectivesOutput - The return type for the suggestObjectives function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Strengths, Difficulties, Needs, Objective } from '@/types';

const SuggestObjectivesInputSchema = z.object({
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
  needs: z.object({
    pedagogicalAccommodations: z.array(z.string()).optional(),
    humanAssistance: z.array(z.string()).optional(),
    compensatoryTools: z.array(z.string()).optional(),
    specialEducationalApproach: z.array(z.string()).optional(),
    complementaryCare: z.array(z.string()).optional(),
  }).optional(),
});
export type SuggestObjectivesInput = z.infer<typeof SuggestObjectivesInputSchema>;

const SuggestObjectivesOutputSchema = z.object({
  objectives: z.array(z.object({
    title: z.string().describe("L'intitulé clair et concis de l'objectif."),
    successCriteria: z.string().describe("Le critère de réussite mesurable pour cet objectif."),
    deadline: z.string().describe("L'échéance suggérée pour atteindre l'objectif, au format JJ/MM/AAAA. Par exemple, si nous sommes en septembre 2024, une échéance crédible serait '15/11/2024'."),
    validationDate: z.string().optional().describe("La date de validation de l'objectif, au format JJ/MM/AAAA."),
  })),
});
export type SuggestObjectivesOutput = z.infer<typeof SuggestObjectivesOutputSchema>;

export async function suggestObjectives(input: SuggestObjectivesInput): Promise<SuggestObjectivesOutput> {
  return suggestObjectivesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestObjectivesPrompt',
  input: { schema: SuggestObjectivesInputSchema },
  output: { schema: SuggestObjectivesOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique spécialisé dans l'éducation inclusive.
    Ton rôle est de proposer des objectifs d'apprentissage prioritaires pour un élève en situation de handicap, en te basant sur son profil.

    Voici le profil de l'élève :

    POINTS FORTS (ce que l'élève sait déjà faire) :
    - Compétences académiques : {{{strengths.academicSkills}}}
    - Forces cognitives : {{{strengths.cognitiveStrengths}}}
    - Habiletés sociales : {{{strengths.socialSkills}}}
    - Intérêts : {{{strengths.exploitableInterests}}}

    DIFFICULTÉS :
    - Cognitives : {{{difficulties.cognitiveDifficulties}}}
    - Scolaires : {{{difficulties.schoolDifficulties}}}
    - Motrices : {{{difficulties.motorDifficulties}}}
    - Socio-émotionnelles : {{{difficulties.socioEmotionalDifficulties}}}
    - Contraintes du handicap : {{{difficulties.disabilityConstraints}}}

    BESOINS ÉDUCATIFS PARTICULIERS :
    - Aménagements pédagogiques : {{{needs.pedagogicalAccommodations}}}
    - Aide humaine : {{{needs.humanAssistance}}}
    - Outils de compensation : {{{needs.compensatoryTools}}}
    - Approche éducative : {{{needs.specialEducationalApproach}}}
    - Soins complémentaires : {{{needs.complementaryCare}}}

    INSTRUCTION IMPORTANTE :
    Analyse le profil complet pour identifier la "zone proximale de développement" de l'élève.
    Ne propose PAS d'objectifs qui répètent les compétences déjà listées dans les "POINTS FORTS".
    Tes suggestions doivent représenter la prochaine étape logique d'apprentissage, en s'appuyant sur les forces pour surmonter les difficultés.

    À partir de cette analyse, définis 3 à 5 objectifs d'apprentissage prioritaires.
    Pour chaque objectif, formule :
    1.  Un intitulé clair, spécifique et centré sur l'élève (commençant par un verbe d'action).
    2.  Un critère de réussite simple et observable.
    3.  Une échéance réaliste dans le futur (par exemple, dans 2 ou 3 mois à partir de la date d'aujourd'hui) et sous forme de date précise (format JJ/MM/AAAA).

    Les objectifs doivent être pertinents, réalisables et directement liés aux besoins identifiés, tout en s'appuyant sur les points forts de l'élève.
    Assure-toi que les suggestions soient variées (scolaires, transversaux comme l'autonomie ou la socialisation).
  `,
});

const suggestObjectivesFlow = ai.defineFlow(
  {
    name: 'suggestObjectivesFlow',
    inputSchema: SuggestObjectivesInputSchema,
    outputSchema: SuggestObjectivesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
