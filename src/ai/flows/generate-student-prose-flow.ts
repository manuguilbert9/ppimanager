
'use server';

/**
 * @fileOverview Generates a descriptive prose text for a student's profile.
 * - generateStudentProse - A function that generates the descriptive text.
 * - GenerateStudentProseInput - The input type for the function.
 * - GenerateStudentProseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Strengths, Difficulties, Needs, Objective, GlobalProfile } from '@/types';

const GenerateStudentProseInputSchema = z.object({
    firstName: z.string(),
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
    globalProfile: z.object({
        communicationSkills: z.string().optional(),
        motorSkills: z.string().optional(),
        dailyLifeAutonomy: z.string().optional(),
        hobbies: z.array(z.string()).optional(),
    }).optional(),
});
export type GenerateStudentProseInput = z.infer<typeof GenerateStudentProseInputSchema>;

const GenerateStudentProseOutputSchema = z.object({
  prose: z.string().describe("Le texte descriptif de l'élève, d'environ 300 mots."),
});
export type GenerateStudentProseOutput = z.infer<typeof GenerateStudentProseOutputSchema>;

export async function generateStudentProse(input: GenerateStudentProseInput): Promise<GenerateStudentProseOutput> {
  return generateStudentProseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentProsePrompt',
  input: { schema: GenerateStudentProseInputSchema },
  output: { schema: GenerateStudentProseOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique et un rédacteur spécialisé dans le domaine du handicap.
    Ton rôle est de rédiger un texte synthétique et descriptif d'environ 300 mots sur un élève, en te basant sur les informations fournies.

    Le texte doit être rédigé dans un style professionnel, bienveillant et objectif. Il doit être fluide, cohérent et éviter le simple listage des points.
    Il doit donner une vision globale et nuancée de l'élève, en liant les différentes informations entre elles.

    Voici les informations sur l'élève, prénommé {{{firstName}}} :

    {{#if strengths}}
    POINTS FORTS (ce sur quoi on peut s'appuyer) :
    {{#if strengths.academicSkills}}- Compétences académiques : {{strengths.academicSkills}}{{/if}}
    {{#if strengths.cognitiveStrengths}}- Forces cognitives et comportementales : {{strengths.cognitiveStrengths}}{{/if}}
    {{#if strengths.socialSkills}}- Habiletés sociales et communicationnelles : {{strengths.socialSkills}}{{/if}}
    {{#if strengths.exploitableInterests}}- Intérêts exploitables : {{strengths.exploitableInterests}}{{/if}}
    {{/if}}

    {{#if globalProfile}}
    COMPÉTENCES TRANSVERSALES (issues du profil global) :
    {{#if globalProfile.communicationSkills}}- Compétences en communication : {{globalProfile.communicationSkills}}{{/if}}
    {{#if globalProfile.motorSkills}}- Compétences motrices : {{globalProfile.motorSkills}}{{/if}}
    {{#if globalProfile.dailyLifeAutonomy}}- Autonomie quotidienne : {{globalProfile.dailyLifeAutonomy}}{{/if}}
    {{/if}}

    {{#if difficulties}}
    DIFFICULTÉS (les défis à relever) :
    {{#if difficulties.cognitiveDifficulties}}- Cognitives : {{difficulties.cognitiveDifficulties}}{{/if}}
    {{#if difficulties.schoolDifficulties}}- Scolaires : {{difficulties.schoolDifficulties}}{{/if}}
    {{#if difficulties.motorDifficulties}}- Motrices : {{difficulties.motorDifficulties}}{{/if}}
    {{#if difficulties.socioEmotionalDifficulties}}- Socio-émotionnelles : {{difficulties.socioEmotionalDifficulties}}{{/if}}
    {{#if difficulties.disabilityConstraints}}- Contraintes du handicap : {{difficulties.disabilityConstraints}}{{/if}}
    {{/if}}

    {{#if needs}}
    BESOINS (les aménagements et aides nécessaires) :
    {{#if needs.pedagogicalAccommodations}}- Aménagements pédagogiques : {{needs.pedagogicalAccommodations}}{{/if}}
    {{#if needs.humanAssistance}}- Aide humaine : {{needs.humanAssistance}}{{/if}}
    {{#if needs.compensatoryTools}}- Outils de compensation : {{needs.compensatoryTools}}{{/if}}
    {{/if}}

    INSTRUCTIONS DE RÉDACTION :
    1.  Commence par une introduction présentant brièvement {{{firstName}}}.
    2.  Décris son profil d'apprentissage en intégrant ses points forts et ses difficultés de manière articulée. Ne te contente pas de les lister. Explique comment les forces peuvent potentiellement compenser ou aider à surmonter les difficultés.
    3.  Aborde ses compétences sociales, son comportement et sa manière d'interagir avec les autres.
    4.  Évoque ses besoins en matière d'adaptations et d'aide, en les justifiant par rapport aux difficultés mentionnées.
    5.  Conclus par une phrase d'ouverture sur son potentiel de progression.
    6.  Le ton doit être positif et centré sur les solutions, même en décrivant les difficultés.
    7.  Le texte final doit faire environ 300 mots.
  `,
});

const generateStudentProseFlow = ai.defineFlow(
  {
    name: 'generateStudentProseFlow',
    inputSchema: GenerateStudentProseInputSchema,
    outputSchema: GenerateStudentProseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
