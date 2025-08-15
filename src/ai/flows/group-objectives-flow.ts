
'use server';

/**
 * @fileOverview Groups students based on semantically similar learning objectives, student level, and acquired skills.
 *
 * - groupObjectives - A function that analyzes and groups objectives.
 * - GroupObjectivesInput - The input type for the groupObjectives function.
 * - GroupObjectivesOutput - The return type for the groupObjectives function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Strengths } from '@/types';

const StudentObjectiveProfileSchema = z.object({
  objectiveTitle: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  deadline: z.string().optional(),
  level: z.string().optional().describe("Le niveau scolaire de l'élève (ex: 'CP', 'CE1')."),
  strengths: z.object({
    academicSkills: z.array(z.string()).optional(),
    cognitiveStrengths: z.array(z.string()).optional(),
    socialSkills: z.array(z.string()).optional(),
    exploitableInterests: z.array(z.string()).optional(),
  }).optional().describe("Les compétences et points forts déjà acquis par l'élève."),
  adaptations: z.array(z.string()).optional().describe("Les moyens et adaptations prévus pour cet objectif."),
});
export type StudentObjectiveProfile = z.infer<typeof StudentObjectiveProfileSchema>;

const GroupObjectivesInputSchema = z.object({
  objectives: z.array(StudentObjectiveProfileSchema),
});
export type GroupObjectivesInput = z.infer<typeof GroupObjectivesInputSchema>;

const StudentObjectiveGroupSchema = z.object({
  groupTitle: z.string().describe("Un titre clair et concis pour le groupe de compétences (ex: 'Calcul mental', 'Lecture fluide')."),
  rationale: z.string().describe("Une brève justification expliquant pourquoi ces élèves ont été regroupés, en tenant compte des objectifs, niveaux et acquis."),
  students: z.array(z.object({
    id: z.string().describe("L'ID de l'élève."),
    name: z.string().describe("Le nom de l'élève."),
    objectiveTitle: z.string().describe("L'intitulé exact de l'objectif individuel de l'élève."),
    deadline: z.string().optional().describe("L'échéance de l'objectif de l'élève."),
  })),
});
export type StudentObjectiveGroup = z.infer<typeof StudentObjectiveGroupSchema>;

const GroupObjectivesOutputSchema = z.object({
  groups: z.array(StudentObjectiveGroupSchema),
});
export type GroupObjectivesOutput = z.infer<typeof GroupObjectivesOutputSchema>;

export async function groupObjectives(input: GroupObjectivesInput): Promise<GroupObjectivesOutput> {
  return groupObjectivesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'groupObjectivesPrompt',
  input: { schema: GroupObjectivesInputSchema },
  output: { schema: GroupObjectivesOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique et en différenciation.
    Ton rôle est d'analyser une liste d'élèves avec leurs objectifs d'apprentissage, leur niveau scolaire, leurs compétences déjà acquises et les adaptations prévues, pour les regrouper de manière pertinente.

    Voici la liste des élèves et leurs profils :
    {{#each objectives}}
    - Élève: {{{studentName}}} (ID: {{{studentId}}})
      - Niveau: {{{level}}}
      - Objectif: "{{{objectiveTitle}}}"
      {{#if deadline}}- Échéance: {{{deadline}}}{{/if}}
      - Compétences acquises: {{#if strengths.academicSkills}}{{{strengths.academicSkills}}}{{else}}Non spécifiées{{/if}}
      - Moyens et adaptations prévus: {{#if adaptations}}{{{adaptations}}}{{else}}Non spécifiés{{/if}}
    {{/each}}

    INSTRUCTIONS :
    1.  Analyse sémantiquement chaque objectif. Ne te contente pas des mots exacts, mais cherche le sens et la compétence visée.
    2.  Prends en compte le NIVEAU, les COMPÉTENCES ACQUISES et les ADAPTATIONS de chaque élève pour affiner les regroupements. L'objectif est de créer des groupes de besoin homogènes.
    3.  Crée des groupes d'élèves qui travaillent sur des objectifs similaires ou complémentaires ET qui ont un niveau de départ proche ou des besoins en adaptation similaires.
    4.  Pour chaque groupe, définis un "Titre de groupe" clair et synthétique qui représente la compétence commune (ex: "Calcul mental additif", "Reconnaissance syllabique", "Initiation à la conversation").
    5.  Pour chaque groupe, fournis une "Justification" expliquant en une phrase pourquoi ces élèves sont regroupés, en mentionnant la compétence et la cohérence de leur niveau ou de leurs besoins.
    6.  Assure-toi que chaque élève de la liste d'entrée soit assigné à un et un seul groupe. Un élève ne peut pas être dans plusieurs groupes.
    7.  Si un objectif est trop unique ou si le profil d'un élève est trop différent pour être regroupé, crée un groupe d'un seul élève.

    Ne te contente pas de regrouper les objectifs qui ont exactement le même intitulé. Par exemple, "Compter jusqu'à 20" et "Dénombrer une collection de 15 objets" peuvent être regroupés sous "Compétences en numération jusqu'à 20" SI les élèves ont des niveaux de compétences proches. De même, deux élèves avec des objectifs différents mais nécessitant tous deux une "guidance verbale" pourraient être regroupés pour un atelier spécifique.
  `,
});

const groupObjectivesFlow = ai.defineFlow(
  {
    name: 'groupObjectivesFlow',
    inputSchema: GroupObjectivesInputSchema,
    outputSchema: GroupObjectivesOutputSchema,
  },
  async (input) => {
    if (input.objectives.length === 0) {
      return { groups: [] };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
