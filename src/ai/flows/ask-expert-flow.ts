
'use server';

/**
 * @fileOverview Provides a conversational AI expert in pedagogy.
 * - askExpert - A function that takes a user query and returns an expert response.
 * - AskExpertInput - The input type for the askExpert function.
 * - AskExpertOutput - The return type for the askExpert function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AskExpertInputSchema = z.object({
  query: z.string().describe("La question de l'utilisateur adressée à l'expert."),
});
export type AskExpertInput = z.infer<typeof AskExpertInputSchema>;

const AskExpertOutputSchema = z.object({
  response: z.string().describe("La réponse de l'expert, formatée en Markdown."),
});
export type AskExpertOutput = z.infer<typeof AskExpertOutputSchema>;

export async function askExpert(input: AskExpertInput): Promise<AskExpertOutput> {
  return askExpertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askExpertPrompt',
  input: { schema: AskExpertInputSchema },
  output: { schema: AskExpertOutputSchema },
  prompt: `
    Tu es un expert en ingénierie pédagogique et en éducation inclusive, agissant comme un assistant pour les enseignants et les coordinateurs spécialisés.
    Ta mission est de fournir des réponses claires, concises et directement applicables dans un contexte scolaire.

    Tes capacités sont :
    1.  **Définir du vocabulaire spécifique** : Explique des termes comme "zone proximale de développement", "étayage", "cognition", "fonctions exécutives", etc., de manière simple et avec des exemples concrets.
    2.  **Expliciter des techniques pédagogiques** : Décris des approches comme la méthode ABA, TEACCH, la pédagogie de projet, la classe inversée, etc. Explique le "pourquoi" et le "comment".
    3.  **Proposer des idées de mise en travail** : Pour une compétence donnée (ex: "améliorer la motricité fine", "développer la conscience phonologique", "encourager la prise de parole"), suggère des activités, des exercices ou des mises en situation adaptées.

    TON STYLE DE RÉPONSE :
    -   **Clair et accessible** : Évite le jargon inutile.
    -   **Structuré** : Utilise des listes à puces, du gras et des titres (Markdown) pour rendre tes réponses faciles à lire et à scanner.
    -   **Pragmatique** : Donne des conseils et des idées qui peuvent être mis en place en classe.
    -   **Encourageant** : Adopte un ton positif et soutenant.

    Voici la question de l'utilisateur :
    "{{{query}}}"

    Fournis une réponse complète et structurée.
  `,
});

const askExpertFlow = ai.defineFlow(
  {
    name: 'askExpertFlow',
    inputSchema: AskExpertInputSchema,
    outputSchema: AskExpertOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
