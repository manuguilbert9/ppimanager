
'use server';

/**
 * @fileOverview Provides a service to determine non-working school days.
 * - getNonWorkingDays - A function that returns holidays and school vacation days for Zone B.
 * - GetNonWorkingDaysInput - The input type for the function.
 * - GetNonWorkingDaysOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetNonWorkingDaysInputSchema = z.object({
  year: z.number().describe("L'année civile pour laquelle récupérer les jours non travaillés."),
});
export type GetNonWorkingDaysInput = z.infer<typeof GetNonWorkingDaysInputSchema>;

const GetNonWorkingDaysOutputSchema = z.object({
  dates: z.array(z.string()).describe("Une liste de dates non travaillées au format AAAA-MM-JJ."),
});
export type GetNonWorkingDaysOutput = z.infer<typeof GetNonWorkingDaysOutputSchema>;

export async function getNonWorkingDays(input: GetNonWorkingDaysInput): Promise<GetNonWorkingDaysOutput> {
  return getNonWorkingDaysFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getNonWorkingDaysPrompt',
  input: { schema: GetNonWorkingDaysInputSchema },
  output: { schema: GetNonWorkingDaysOutputSchema },
  prompt: `
    Ta mission est de fournir une liste exhaustive de toutes les dates correspondant aux vacances scolaires et jours fériés pour la Zone B en France pour l'année {{{year}}}.
    La liste doit inclure :
    1.  Tous les jours fériés officiels en France.
    2.  Toutes les dates comprises dans les périodes de vacances scolaires de la Zone B (Toussaint, Noël, Hiver, Printemps).
    3.  L'intégralité des mois de Juillet et Août doit être considérée comme faisant partie des vacances d'été.

    INSTRUCTIONS IMPORTANTES :
    -   Le format de chaque date dans la liste DOIT être "AAAA-MM-JJ".
    -   N'inclus PAS les samedis et dimanches en dehors des périodes de vacances et des jours fériés. La logique métier s'en chargera.
    -   Assure-toi que les plages de vacances incluent bien le premier ET le dernier jour de la période.
    -   Pour l'année en cours, si les futures vacances (hors été) de l'année scolaire {{{year}}}-{{{year}}+1 ne sont pas encore officiellement définies, ne les invente pas.

    Exemple pour le 1er mai 2024 : la liste doit contenir "2024-05-01".
    Exemple pour les vacances de la Toussaint 2024 (Zone B) du samedi 19 oct au dimanche 3 nov : la liste doit contenir toutes les dates du "2024-10-19" au "2024-11-03" inclusivement.
    Exemple pour les vacances d'été : inclure toutes les dates du "AAAA-07-01" au "AAAA-08-31".

    Génère la liste de dates pour l'année {{{year}}}.
  `,
});

const getNonWorkingDaysFlow = ai.defineFlow(
  {
    name: 'getNonWorkingDaysFlow',
    inputSchema: GetNonWorkingDaysInputSchema,
    outputSchema: GetNonWorkingDaysOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
