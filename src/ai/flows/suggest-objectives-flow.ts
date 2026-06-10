'use server';

/**
 * @fileOverview Suggère des objectifs d'apprentissage prioritaires,
 * opérationnalisés selon la démarche PPI : référés aux programmes et au
 * socle commun, formulés avec un verbe d'action, assortis d'un critère de
 * réussite observable, d'une échéance et de moyens (démarches, supports).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getTroubles } from '@/lib/egron/troubles';

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
  /** Besoins prioritaires hiérarchisés (fondement des objectifs). */
  priorityNeeds: z.array(z.string()).optional(),
  /** Niveaux scolaires par domaine (« Lecture : cycle 2 – mi-CE1 (...) »). */
  academicLevels: z.array(z.string()).optional(),
  troubleIds: z.array(z.string()).optional(),
});
export type SuggestObjectivesInput = z.infer<typeof SuggestObjectivesInputSchema>;

const SuggestObjectivesOutputSchema = z.object({
  objectives: z.array(z.object({
    title: z.string().describe("Intitulé clair, centré sur l'élève, commençant par un verbe d'action observable."),
    domain: z.string().describe("Domaine d'apprentissage (ex. : Français – lecture, Mathématiques – nombres et calcul, Transversal – autonomie)."),
    competenceRef: z.string().describe('Compétence visée, en référence aux programmes ou au socle commun, avec le cycle.'),
    means: z.array(z.string()).describe("2 à 4 démarches, moyens ou supports pour travailler cet objectif."),
    successCriteria: z.string().describe('Critère de réussite simple et observable.'),
    deadline: z.string().describe("Échéance réaliste au format JJ/MM/AAAA, dans le futur (2 à 4 mois)."),
  })),
});
export type SuggestObjectivesOutput = z.infer<typeof SuggestObjectivesOutputSchema>;

export async function suggestObjectives(input: SuggestObjectivesInput): Promise<SuggestObjectivesOutput> {
  return suggestObjectivesFlow(input);
}

const formatList = (label: string, values?: string[]) =>
  values && values.length > 0 ? `- ${label} : ${values.join(' ; ')}` : '';

const prompt = ai.definePrompt({
  name: 'suggestObjectivesPrompt',
  input: {
    schema: z.object({
      profileText: z.string(),
      priorityNeedsText: z.string(),
      academicLevelsText: z.string(),
      troublesText: z.string(),
      currentDate: z.string(),
    }),
  },
  output: { schema: SuggestObjectivesOutputSchema },
  prompt: `
    Tu es un enseignant spécialisé expert, formé à la démarche PPI de Bruno Egron
    (« Enseigner en unité d'enseignement », Retz).

    PRINCIPES :
    - Le PPI décline des objectifs choisis parmi les programmes nationaux et le socle commun, en lien avec
      les capacités d'apprentissage de l'élève. Les objectifs du socle ne sont pas modifiés : c'est le
      chemin pour les atteindre qui est individualisé.
    - Chaque objectif découle d'un besoin prioritaire identifié.
    - Vise la zone proximale de développement : la prochaine étape logique, ni déjà acquise, ni hors de portée.
    - Ne pas sous-alimenter cognitivement l'élève : la reconstruction de l'estime de soi passe par un
      obstacle surmonté, pas par des tâches sans effort cognitif.
    - Varier : objectifs disciplinaires ET transversaux (autonomie, socialisation, processus d'apprentissage).

    {{#if priorityNeedsText}}
    BESOINS PRIORITAIRES RETENUS (fondement des objectifs, dans l'ordre de priorité) :
    {{{priorityNeedsText}}}
    {{/if}}

    {{#if academicLevelsText}}
    NIVEAUX SCOLAIRES PAR DOMAINE (évaluation diagnostique — attention aux profils dysharmoniques) :
    {{{academicLevelsText}}}
    {{/if}}

    {{#if troublesText}}
    TROUBLES IDENTIFIÉS :
    {{{troublesText}}}
    {{/if}}

    {{#if profileText}}
    PROFIL COMPLÉMENTAIRE :
    {{{profileText}}}
    {{/if}}

    INSTRUCTIONS :
    Propose 3 à 5 objectifs prioritaires. Pour chacun :
    1. Un intitulé centré sur l'élève, commençant par un verbe d'action observable (« Lire... », « Résoudre... », « Demander de l'aide... »).
    2. Le domaine d'apprentissage.
    3. La compétence visée en référence aux programmes ou au socle commun, avec le cycle correspondant au niveau réel de l'élève dans ce domaine (pas à son âge).
    4. 2 à 4 démarches/moyens/supports concrets pour le travailler, en t'appuyant sur les points forts et les intérêts de l'élève comme leviers.
    5. Un critère de réussite simple et observable (quantifié si possible).
    6. Une échéance réaliste au format JJ/MM/AAAA. Nous sommes le {{{currentDate}}} : l'échéance doit être dans le futur (2 à 4 mois).
    Ne propose pas d'objectifs qui répètent des compétences déjà acquises.
  `,
});

const suggestObjectivesFlow = ai.defineFlow(
  {
    name: 'suggestObjectivesFlow',
    inputSchema: SuggestObjectivesInputSchema,
    outputSchema: SuggestObjectivesOutputSchema,
  },
  async (input) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');

    const troubles = getTroubles(input.troubleIds || []);
    const troublesText = troubles.map((t) => `- ${t.label}`).join('\n');

    const profileText = [
      formatList('Compétences académiques acquises', input.strengths?.academicSkills),
      formatList('Forces cognitives', input.strengths?.cognitiveStrengths),
      formatList('Habiletés sociales', input.strengths?.socialSkills),
      formatList('Intérêts exploitables (leviers)', input.strengths?.exploitableInterests),
      formatList('Difficultés cognitives', input.difficulties?.cognitiveDifficulties),
      formatList('Difficultés scolaires', input.difficulties?.schoolDifficulties),
      formatList('Difficultés motrices', input.difficulties?.motorDifficulties),
      formatList('Difficultés socio-émotionnelles', input.difficulties?.socioEmotionalDifficulties),
      formatList('Aménagements pédagogiques', input.needs?.pedagogicalAccommodations),
      formatList('Aide humaine', input.needs?.humanAssistance),
      formatList('Outils de compensation', input.needs?.compensatoryTools),
    ].filter(Boolean).join('\n');

    const { output } = await prompt({
      profileText,
      priorityNeedsText: (input.priorityNeeds || []).map((n, i) => `${i + 1}. ${n}`).join('\n'),
      academicLevelsText: (input.academicLevels || []).map((l) => `- ${l}`).join('\n'),
      troublesText,
      currentDate,
    });
    return output!;
  }
);
