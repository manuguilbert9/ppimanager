
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
  input: { schema: z.object({
    firstName: z.string(),
    studentData: z.string(),
  }) },
  output: { schema: GenerateStudentProseOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique et un rédacteur spécialisé dans le domaine du handicap.
    Ton rôle est de rédiger un texte synthétique et descriptif d'environ 300 mots sur un élève, en te basant sur les informations fournies.

    Le texte doit être rédigé dans un style professionnel, bienveillant et objectif. Il doit être fluide, cohérent et éviter le simple listage des points.
    Il doit donner une vision globale et nuancée de l'élève, en liant les différentes informations entre elles.

    Voici les informations brutes sur l'élève, prénommé {{{firstName}}} :
    {{{studentData}}}

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

    let studentDataString = "";

    const addSection = (title: string, content: string[] | string | undefined) => {
        if (!content) return;
        
        if ((Array.isArray(content) && content.length === 0) || (typeof content === 'string' && content.trim() === '')) {
            return;
        }
        studentDataString += `${title.toUpperCase()}\n`;
        if (Array.isArray(content)) {
            studentDataString += content.map(item => `- ${item}`).join('\n');
        } else {
            studentDataString += `${content}\n`;
        }
        studentDataString += '\n\n';
    };
    
    // Strengths
    if (input.strengths) {
        addSection("Compétences académiques", input.strengths.academicSkills);
        addSection("Forces cognitives et comportementales", input.strengths.cognitiveStrengths);
        addSection("Habiletés sociales et communicationnelles", input.strengths.socialSkills);
        addSection("Intérêts exploitables", input.strengths.exploitableInterests);
    }

    // Global Profile
    if (input.globalProfile) {
        addSection("Compétences en communication (profil global)", input.globalProfile.communicationSkills);
        addSection("Compétences motrices (profil global)", input.globalProfile.motorSkills);
        addSection("Autonomie quotidienne (profil global)", input.globalProfile.dailyLifeAutonomy);
        addSection("Loisirs (profil global)", input.globalProfile.hobbies);
    }
    
    // Difficulties
    if (input.difficulties) {
        addSection("Difficultés cognitives", input.difficulties.cognitiveDifficulties);
        addSection("Difficultés scolaires", input.difficulties.schoolDifficulties);
        addSection("Difficultés motrices", input.difficulties.motorDifficulties);
        addSection("Difficultés socio-émotionnelles", input.difficulties.socioEmotionalDifficulties);
        addSection("Contraintes du handicap", input.difficulties.disabilityConstraints);
    }

    // Needs
    if (input.needs) {
        addSection("Aménagements pédagogiques", input.needs.pedagogicalAccommodations);
        addSection("Aide humaine", input.needs.humanAssistance);
        addSection("Outils de compensation", input.needs.compensatoryTools);
    }

    const { output } = await prompt({
        firstName: input.firstName,
        studentData: studentDataString,
    });
    return output!;
  }
);
