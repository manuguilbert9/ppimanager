'use server';

/**
 * @fileOverview Suggère des adaptations pour un objectif d'apprentissage,
 * ancrées dans les pistes pédagogiques du référentiel (B. Egron, « Enseigner
 * en unité d'enseignement », Retz) pour les troubles identifiés chez l'élève.
 */

import { ai } from '@/ai/genkit';
import { getLibraryItems } from '@/lib/library-repository';
import { getTroubles } from '@/lib/egron/troubles';
import { z } from 'zod';

const SuggestAdaptationsInputSchema = z.object({
  objectiveTitle: z.string().describe("L'intitulé de l'objectif pour lequel suggérer des adaptations."),
  troubleIds: z.array(z.string()).optional().describe("Identifiants des troubles de l'élève (référentiel Egron)."),
  priorityNeeds: z.array(z.string()).optional().describe("Besoins prioritaires retenus pour l'élève."),
  userId: z.string().optional().describe("UID Firebase de l'utilisateur courant, pour filtrer la bibliothèque personnelle."),
});
export type SuggestAdaptationsInput = z.infer<typeof SuggestAdaptationsInputSchema>;

const SuggestAdaptationsOutputSchema = z.object({
  adaptations: z.array(z.string()).describe("Une liste de 3 à 6 adaptations pertinentes pour l'objectif."),
});
export type SuggestAdaptationsOutput = z.infer<typeof SuggestAdaptationsOutputSchema>;

export async function suggestAdaptations(input: SuggestAdaptationsInput): Promise<SuggestAdaptationsOutput> {
  return suggestAdaptationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAdaptationsPrompt',
  input: {
    schema: z.object({
      objectiveTitle: z.string(),
      priorityNeeds: z.string(),
      referentialPistes: z.string(),
      existingAdaptations: z.string(),
    }),
  },
  output: { schema: SuggestAdaptationsOutputSchema },
  prompt: `
    Tu es un enseignant spécialisé expert, formé à la démarche de Bruno Egron (« Enseigner en unité d'enseignement », Retz).
    L'adaptation se définit comme la mise en œuvre des ajustements nécessaires pour tenir compte des besoins de l'élève,
    afin de lui permettre d'acquérir les compétences définies dans les programmes. Les objectifs du socle commun ne sont
    pas modifiés : c'est le programme d'enseignement qui est ajusté.

    OBJECTIF DE L'ÉLÈVE : "{{{objectiveTitle}}}"

    {{#if priorityNeeds}}
    BESOINS PRIORITAIRES DE L'ÉLÈVE :
    {{{priorityNeeds}}}
    {{/if}}

    {{#if referentialPistes}}
    PISTES PÉDAGOGIQUES DU RÉFÉRENTIEL POUR LES TROUBLES DE CET ÉLÈVE (source principale, à privilégier) :
    {{{referentialPistes}}}
    {{/if}}

    {{#if existingAdaptations}}
    Adaptations déjà utilisées dans l'établissement (pour inspiration) :
    {{{existingAdaptations}}}
    {{/if}}

    INSTRUCTIONS :
    - Propose 3 à 6 adaptations très concrètes, directement liées à l'objectif ET cohérentes avec les pistes du référentiel ci-dessus.
    - Chaque adaptation est une action directement utilisable par l'enseignant (commence par un verbe à l'infinitif).
    - Sélectionne uniquement les pistes pertinentes pour cet objectif : les élèves ont rarement besoin de l'ensemble des adaptations décrites pour un trouble.
    - Reste dans le registre pédagogique (pas de prescriptions médicales).
  `,
});

const suggestAdaptationsFlow = ai.defineFlow(
  {
    name: 'suggestAdaptationsFlow',
    inputSchema: SuggestAdaptationsInputSchema,
    outputSchema: SuggestAdaptationsOutputSchema,
  },
  async (input) => {
    const adaptations = await getLibraryItems('adaptations', input.userId);
    const existingAdaptations = adaptations.map((item) => item.text);

    // Injecte les pistes pédagogiques du livre pour les troubles de l'élève.
    const troubles = getTroubles(input.troubleIds || []);
    const referentialPistes = troubles
      .map((t) => {
        const pistes = t.pistes
          .map((theme) => `  ${theme.theme} :\n${theme.items.map((i) => `    - ${i}`).join('\n')}`)
          .join('\n');
        return `${t.label} :\n${pistes}`;
      })
      .join('\n\n');

    const { output } = await prompt({
      objectiveTitle: input.objectiveTitle,
      priorityNeeds: (input.priorityNeeds || []).map((n) => `- ${n}`).join('\n'),
      referentialPistes,
      existingAdaptations: existingAdaptations.slice(0, 40).join(' ; '),
    });
    return output!;
  }
);
