'use server';

/**
 * @fileOverview Extracts structured data from a GevaSco PDF document.
 *
 * - extractGevascoData - A function that extracts data from a GevaSco document.
 * - ExtractGevascoInput - The input type for the function.
 * - ExtractGevascoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractGevascoInputSchema = z.object({
  document: z.string().describe("A GevaSco PDF document encoded as a Base64 data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type ExtractGevascoInput = z.infer<typeof ExtractGevascoInputSchema>;

const StrengthsSchema = z.object({
  academicSkills: z.array(z.string()).optional().describe("Les compétences scolaires et académiques acquises par l'élève."),
  cognitiveStrengths: z.array(z.string()).optional().describe("Les points forts cognitifs et comportementaux de l'élève (ex: mémoire, attention)."),
  socialSkills: z.array(z.string()).optional().describe("Les habiletés sociales et de communication de l'élève."),
  exploitableInterests: z.array(z.string()).optional().describe("Les centres d'intérêt de l'élève qui peuvent être un levier pour les apprentissages."),
});

const DifficultiesSchema = z.object({
  cognitiveDifficulties: z.array(z.string()).optional().describe("Les difficultés d'ordre cognitif (ex: trouble de l'attention, dyslexie)."),
  schoolDifficulties: z.array(z.string()).optional().describe("Les difficultés rencontrées dans le cadre scolaire (ex: lecture, écriture, calcul)."),
  motorDifficulties: z.array(z.string()).optional().describe("Les difficultés motrices, qu'elles soient fines ou globales."),
  socioEmotionalDifficulties: z.array(z.string()).optional().describe("Les difficultés d'ordre social, émotionnel ou comportemental."),
  disabilityConstraints: z.array(z.string()).optional().describe("Les contraintes directes liées au handicap (ex: fatigabilité, besoin de pauses)."),
});

const NeedsSchema = z.object({
  pedagogicalAccommodations: z.array(z.string()).optional().describe("Les aménagements pédagogiques nécessaires (ex: Agrandir les textes, temps majoré)."),
  humanAssistance: z.array(z.string()).optional().describe("Le besoin d'une aide humaine (ex: AESH, tuteur)."),
  compensatoryTools: z.array(z.string()).optional().describe("Les outils de compensation à mettre en place (ex: ordinateur, logiciel de synthèse vocale)."),
  specialEducationalApproach: z.array(z.string()).optional().describe("Les approches éducatives spécifiques recommandées (ex: ABA, TEACCH)."),
  complementaryCare: z.array(z.string()).optional().describe("Les soins ou rééducations complémentaires (ex: orthophonie, psychomotricité)."),
});

const ExtractGevascoOutputSchema = z.object({
  strengths: StrengthsSchema.optional().describe("Synthèse des points forts et des acquis de l'élève."),
  difficulties: DifficultiesSchema.optional().describe("Synthèse des difficultés et limitations rencontrées par l'élève."),
  needs: NeedsSchema.optional().describe("Synthèse des besoins éducatifs particuliers pour compenser le handicap."),
});
export type ExtractGevascoOutput = z.infer<typeof ExtractGevascoOutputSchema>;

export async function extractGevascoData(input: ExtractGevascoInput): Promise<ExtractGevascoOutput> {
  return extractGevascoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractGevascoPrompt',
  input: { schema: ExtractGevascoInputSchema },
  output: { schema: ExtractGevascoOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique spécialisé dans l'analyse de documents GevaSco pour les élèves en situation de handicap.
    Analyse le document PDF GevaSco fourni et extrais les informations clés de manière structurée.

    Document à analyser : {{media url=document}}

    INSTRUCTIONS :
    1.  Lis attentivement l'ensemble du document.
    2.  Identifie et synthétise les informations relatives aux points forts (acquis, compétences, centres d'intérêt), aux difficultés (scolaires, cognitives, comportementales) et aux besoins (aménagements, aides, matériel).
    3.  Ne te contente pas de copier/coller. Reformule les éléments sous forme de listes claires et concises. Chaque élément de liste doit être une phrase ou un groupe de mots court et précis.
    4.  Si une section est vide ou non pertinente dans le document, laisse le champ correspondant vide dans ta réponse.
    5.  Fais particulièrement attention à la section "Synthèse" et aux "préconisations" ou "recommandations" du document, car elles contiennent souvent les informations les plus importantes.
    6.  Classe chaque information extraite dans la catégorie la plus appropriée (strengths, difficulties, needs) et la sous-catégorie correspondante.
  `,
});

const extractGevascoFlow = ai.defineFlow(
  {
    name: 'extractGevascoFlow',
    inputSchema: ExtractGevascoInputSchema,
    outputSchema: ExtractGevascoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
