'use server';

/**
 * @fileOverview Suggère les besoins éducatifs particuliers d'un élève à
 * partir de la grille d'observation des fonctionnements, des troubles
 * identifiés, des points d'appui et des difficultés.
 *
 * Démarche de référence : B. Egron, « Enseigner en unité d'enseignement »,
 * Retz, chap. 13 « Identifier les besoins des élèves » : l'observation
 * récolte des faits ; l'analyse identifie les besoins importants et
 * récurrents ; tous les besoins ne sont pas d'un même niveau, il faut les
 * hiérarchiser.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getTroubles } from '@/lib/egron/troubles';
import { OBSERVATION_DOMAINS } from '@/lib/egron/observation-grid';
import { AiGenerationError, isServiceDisabledError } from '@/ai/errors';

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
  /** Observations de la grille : { domainId: { entries: { itemId: { facts, needs } }, synthesis } } */
  observations: z
    .record(
      z.object({
        entries: z
          .record(
            z.object({
              facts: z.string().optional(),
              needs: z.array(z.string()).optional(),
            })
          )
          .optional(),
        synthesis: z.string().optional(),
      })
    )
    .optional(),
  troubleIds: z.array(z.string()).optional(),
});
export type SuggestNeedsInput = z.infer<typeof SuggestNeedsInputSchema>;

const SuggestNeedsOutputSchema = z.object({
  pedagogicalAccommodations: z.array(z.string()).describe("Besoins d'aménagements pédagogiques."),
  humanAssistance: z.array(z.string()).describe("Besoins d'aide humaine."),
  compensatoryTools: z.array(z.string()).describe("Besoins d'outils de compensation."),
  specialEducationalApproach: z.array(z.string()).describe("Besoins en approche éducative particulière."),
  complementaryCare: z.array(z.string()).describe('Besoins de soins ou rééducations complémentaires.'),
  priorityNeeds: z
    .array(
      z.object({
        label: z.string().describe('Le besoin, formulé « Besoin de... » / « Besoin d\'un... ».'),
        domain: z.string().describe("Champ de fonctionnement d'origine (ex. : fonctionnement cognitif général)."),
        rationale: z.string().describe('Pourquoi ce besoin est prioritaire pour cet élève, en référence aux faits observés.'),
      })
    )
    .describe('3 à 5 besoins prioritaires hiérarchisés, du plus important au moins important.'),
});
export type SuggestNeedsOutput = z.infer<typeof SuggestNeedsOutputSchema>;

export async function suggestNeeds(input: SuggestNeedsInput): Promise<SuggestNeedsOutput> {
  return suggestNeedsFlow(input);
}

/** Met en forme la grille d'observation pour le prompt. */
function formatObservations(observations: SuggestNeedsInput['observations']): string {
  if (!observations) return '';
  const blocks: string[] = [];
  for (const domain of OBSERVATION_DOMAINS) {
    const data = observations[domain.id];
    if (!data) continue;
    const lines: string[] = [];
    for (const item of domain.items) {
      const entry = data.entries?.[item.id];
      if (!entry) continue;
      const facts = entry.facts?.trim();
      const needs = (entry.needs || []).filter((n) => n.trim().length > 0);
      if (!facts && needs.length === 0) continue;
      lines.push(
        `  - ${item.label} : ${facts || '(pas de faits notés)'}${needs.length > 0 ? ` | Besoins repérés : ${needs.join(' ; ')}` : ''}`
      );
    }
    if (data.synthesis?.trim()) {
      lines.push(`  Synthèse du champ : ${data.synthesis.trim()}`);
    }
    if (lines.length > 0) {
      blocks.push(`${domain.title} :\n${lines.join('\n')}`);
    }
  }
  return blocks.join('\n\n');
}

const prompt = ai.definePrompt({
  name: 'suggestNeedsPrompt',
  input: {
    schema: z.object({
      strengthsText: z.string(),
      difficultiesText: z.string(),
      observationsText: z.string(),
      troublesText: z.string(),
    }),
  },
  output: { schema: SuggestNeedsOutputSchema },
  prompt: `
    Tu es un enseignant spécialisé expert, formé à la démarche d'identification des besoins de Bruno Egron
    (« Enseigner en unité d'enseignement », Retz, chapitre 13).

    PRINCIPES DE LA DÉMARCHE :
    - Les besoins se déduisent de l'analyse des faits observés (jamais de jugements ni d'étiquettes).
    - Un besoin se formule « Besoin de... » / « Besoin d'un... » : c'est ce qu'il faut apporter à l'élève dans la sphère scolaire, pas une difficulté reformulée.
    - Tous les besoins ne sont pas d'un même niveau : il faut hiérarchiser et retenir les besoins importants et récurrents.
    - Certains besoins ne relèvent pas de la sphère scolaire (soins, rééducations) : les distinguer.
    - Les points forts sont des leviers à exploiter, pas des besoins.

    PROFIL DE L'ÉLÈVE :

    {{#if troublesText}}
    TROUBLES IDENTIFIÉS (avec leurs incidences typiques sur les apprentissages) :
    {{{troublesText}}}
    {{/if}}

    {{#if strengthsText}}
    POINTS D'APPUI (leviers) :
    {{{strengthsText}}}
    {{/if}}

    {{#if difficultiesText}}
    DIFFICULTÉS CONSTATÉES :
    {{{difficultiesText}}}
    {{/if}}

    {{#if observationsText}}
    GRILLE D'OBSERVATION DES FONCTIONNEMENTS (faits observés par champ — source principale de ton analyse) :
    {{{observationsText}}}
    {{/if}}

    INSTRUCTIONS :
    1. Analyse en priorité la grille d'observation : identifie les besoins récurrents, ceux qui reviennent dans plusieurs champs ou plusieurs situations.
    2. Propose des besoins concrets et spécifiques pour chaque catégorie (3 à 5 par catégorie si pertinent, listes vides autorisées) :
       - Aménagements pédagogiques (supports, consignes, temps, évaluations, environnement)
       - Aide humaine (AESH, tutorat : pour quelles tâches précisément)
       - Outils de compensation (matériels, logiciels)
       - Approche éducative particulière (cadre, démarches, méthodes)
       - Soins ou rééducations complémentaires (hors sphère scolaire)
    3. Puis hiérarchise : retiens 3 à 5 besoins PRIORITAIRES, du plus important au moins important, chacun avec
       son champ de fonctionnement d'origine et une justification courte ancrée dans les faits observés.
       Privilégie les besoins qui conditionnent les autres apprentissages.
  `,
});

const formatList = (label: string, values?: string[]) =>
  values && values.length > 0 ? `- ${label} : ${values.join(' ; ')}` : '';

const suggestNeedsFlow = ai.defineFlow(
  {
    name: 'suggestNeedsFlow',
    inputSchema: SuggestNeedsInputSchema,
    outputSchema: SuggestNeedsOutputSchema,
  },
  async (input) => {
    try {
      const troubles = getTroubles(input.troubleIds || []);
      const troublesText = troubles
        .map((t) => `${t.label} :\n${t.incidences.map((i) => `  - ${i}`).join('\n')}`)
        .join('\n\n');

      const strengthsText = [
        formatList('Compétences académiques', input.strengths?.academicSkills),
        formatList('Forces cognitives', input.strengths?.cognitiveStrengths),
        formatList('Habiletés sociales', input.strengths?.socialSkills),
        formatList('Intérêts exploitables', input.strengths?.exploitableInterests),
      ].filter(Boolean).join('\n');

      const difficultiesText = [
        formatList('Cognitives', input.difficulties?.cognitiveDifficulties),
        formatList('Scolaires', input.difficulties?.schoolDifficulties),
        formatList('Motrices', input.difficulties?.motorDifficulties),
        formatList('Socio-émotionnelles', input.difficulties?.socioEmotionalDifficulties),
        formatList('Contraintes du handicap', input.difficulties?.disabilityConstraints),
      ].filter(Boolean).join('\n');

      const observationsText = formatObservations(input.observations);

      const { output } = await prompt({
        strengthsText,
        difficultiesText,
        observationsText,
        troublesText,
      });
      return output!;
    } catch (error) {
      console.error("Erreur lors de l'appel au service de génération", error);

      if (error instanceof AiGenerationError) {
        throw error;
      }

      if (isServiceDisabledError(error)) {
        throw new AiGenerationError(
          "[SERVICE_DISABLED] Le service d'IA est indisponible pour ce projet. Vérifiez la clé API configurée, puis réessayez.",
          'SERVICE_DISABLED',
          error
        );
      }

      const fallbackMessage =
        error instanceof Error && error.message
          ? error.message
          : "Une erreur est survenue lors de la génération des besoins par l'IA.";

      throw new AiGenerationError(fallbackMessage, 'UNKNOWN', error);
    }
  }
);
