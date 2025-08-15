'use server';

/**
 * @fileOverview Groups students based on semantically similar learning objectives.
 *
 * - groupObjectives - A function that analyzes and groups objectives.
 * - GroupObjectivesInput - The input type for the groupObjectives function.
 * - GroupObjectivesOutput - The return type for the groupObjectives function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ObjectiveWithStudentSchema = z.object({
  objectiveTitle: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  deadline: z.string().optional(),
});
export type ObjectiveWithStudent = z.infer<typeof ObjectiveWithStudentSchema>;

const GroupObjectivesInputSchema = z.object({
  objectives: z.array(ObjectiveWithStudentSchema),
});
export type GroupObjectivesInput = z.infer<typeof GroupObjectivesInputSchema>;

const StudentObjectiveGroupSchema = z.object({
  groupTitle: z.string().describe("Un titre clair et concis pour le groupe de compétences (ex: 'Calcul mental', 'Lecture fluide')."),
  rationale: z.string().describe("Une brève justification expliquant pourquoi ces objectifs ont été regroupés."),
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
    Ton rôle est d'analyser une liste d'objectifs d'apprentissage individuels d'élèves et de les regrouper par compétences ou domaines sémantiquement proches pour faciliter l'organisation d'ateliers.

    Voici la liste des objectifs :
    {{#each objectives}}
    - Élève: {{{studentName}}} (ID: {{{studentId}}}), Objectif: "{{{objectiveTitle}}}"{{#if deadline}}, Échéance: {{{deadline}}}{{/if}}
    {{/each}}

    INSTRUCTIONS :
    1.  Analyse sémantiquement chaque objectif. Ne te contente pas des mots exacts, mais cherche le sens et la compétence visée.
    2.  Crée des groupes d'élèves qui travaillent sur des objectifs similaires ou complémentaires.
    3.  Pour chaque groupe, définis un "Titre de groupe" clair et synthétique qui représente la compétence commune (ex: "Calcul mental additif", "Reconnaissance syllabique", "Initiation à la conversation").
    4.  Pour chaque groupe, fournis une "Justification" expliquant en une phrase pourquoi ces élèves sont regroupés (ex: "Ces élèves travaillent tous sur la décomposition des nombres pour faciliter le calcul.").
    5.  Assure-toi que chaque élève de la liste d'entrée soit assigné à un et un seul groupe. Un élève ne peut pas être dans plusieurs groupes.
    6.  Si un objectif est trop unique pour être regroupé, crée un groupe d'un seul élève.

    Ne te contente pas de regrouper les objectifs qui ont exactement le même intitulé. Par exemple, "Compter jusqu'à 20" et "Dénombrer une collection de 15 objets" peuvent être regroupés sous "Compétences en numération jusqu'à 20".
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
