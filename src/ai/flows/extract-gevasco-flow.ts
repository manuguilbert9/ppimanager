
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

const GlobalProfileSchema = z.object({
    disabilityNatures: z.array(z.string()).optional().describe("Le ou les diagnostics principaux (ex: Trouble du Spectre de l'Autisme)."),
    associatedDisorders: z.array(z.string()).optional().describe("Les autres troubles associés (ex: TDAH, troubles DYS)."),
    medicalNeeds: z.array(z.string()).optional().describe("Les besoins médicaux spécifiques qui impactent la scolarité (ex: Suivi PAI, Prise de médicaments)."),
    equipment: z.array(z.string()).optional().describe("Les appareillages utilisés par l'élève (ex: Fauteuil roulant, appareil auditif).")
});

const FamilyContactSchema = z.object({
    title: z.string().describe("Le lien de parenté (ex: Mère, Père, Responsable légal 1)."),
    name: z.string().describe("Le nom et prénom du contact."),
});

const AdministrativeDataSchema = z.object({
    birthDate: z.string().optional().describe("La date de naissance de l'élève (JJ/MM/AAAA)."),
    level: z.string().optional().describe("Le niveau scolaire de référence de l'élève (ex: 6ème, CE2)."),
    mdphNotificationTitle: z.string().optional().describe("L'intitulé de la notification de décision de la MDPH."),
    mdphNotificationExpiration: z.string().optional().describe("La date d'échéance de la notification MDPH (JJ/MM/AAAA)."),
    familyContacts: z.array(FamilyContactSchema).optional().describe("La liste des contacts familiaux."),
});

const ExtractGevascoOutputSchema = z.object({
  strengths: StrengthsSchema.optional().describe("Synthèse des points forts et des acquis de l'élève."),
  difficulties: DifficultiesSchema.optional().describe("Synthèse des difficultés et limitations rencontrées par l'élève."),
  needs: NeedsSchema.optional().describe("Synthèse des besoins éducatifs particuliers pour compenser le handicap."),
  globalProfile: GlobalProfileSchema.optional().describe("Informations générales sur la situation de l'élève."),
  administrativeData: AdministrativeDataSchema.optional().describe("Données administratives extraites du document.")
});
export type ExtractGevascoOutput = z.infer<typeof ExtractGevascoOutputSchema>;

const prompt = ai.definePrompt({
  name: 'extractGevascoPrompt',
  input: { schema: ExtractGevascoInputSchema },
  output: { schema: ExtractGevascoOutputSchema },
  model: 'googleai/gemini-1.5-pro-latest',
  prompt: `
    Tu es un expert en ingénierie pédagogique spécialisé dans l'analyse de documents GevaSco pour les élèves en situation de handicap.
    Analyse le document PDF GevaSco fourni et extrais les informations clés de manière structurée en remplissant TOUS les champs demandés dans le format de sortie.

    Document à analyser : {{media url=document}}

    INSTRUCTIONS DÉTAILLÉES :
    1.  **Analyse Approfondie** : Lis attentivement l'intégralité du document. Fais particulièrement attention aux sections "Synthèse", "Attentes", "Préconisations", "Recommandations", et aux cadres administratifs.
    2.  **Reformulation** : Ne te contente JAMAIS de copier/coller. Reformule chaque information sous forme de phrases ou d'éléments de liste clairs, concis et exploitables.
    3.  **Extraction Structurée** : Extrais les informations suivantes et classe-les précisément. Si une information n'est pas présente, laisse le champ vide. Ne déduis pas d'informations non écrites.

        a.  **Données Administratives (administrativeData)**:
            -   \`birthDate\`: La date de naissance de l'élève.
            -   \`level\`: Le niveau ou la classe de référence.
            -   \`mdphNotificationTitle\`: L'intitulé exact de la décision MDPH (ex: "Orientation en ULIS", "Accompagnement par AESH mutualisée 8h/semaine").
            -   \`mdphNotificationExpiration\`: La date de FIN de validité de la notification MDPH.
            -   \`familyContacts\`: Identifie les responsables légaux, extrais leur lien (\`title\`, ex: Mère, Père) et leur nom complet (\`name\`).

        b.  **Profil Global (globalProfile)**:
            -   \`disabilityNatures\`: Le ou les diagnostics principaux (ex: "Trouble du Spectre de l'Autisme", "Troubles Spécifiques du Langage et des Apprentissages").
            -   \`associatedDisorders\`: Les autres troubles mentionnés (ex: "TDAH", "Trouble oppositionnel avec provocation").
            -   \`medicalNeeds\`: Les besoins médicaux qui impactent la scolarité (ex: "Suivi PAI pour asthme", "Prise de médicaments sur le temps scolaire").
            -   \`equipment\`: Les appareillages et matériel spécifiques utilisés par l'élève (ex: "Fauteuil roulant électrique", "Appareils auditifs", "Verticalisateur").

        c.  **Points Forts (strengths)**:
            -   \`academicSkills\`: Les compétences scolaires acquises (ex: "Reconnaît les lettres de l'alphabet", "Peut compter jusqu'à 20").
            -   \`cognitiveStrengths\`: Les forces cognitives (ex: "Excellente mémoire visuelle", "Bonne capacité de concentration sur des tâches courtes").
            -   \`socialSkills\`: Les habiletés sociales (ex: "Recherche l'interaction avec l'adulte", "Participe aux jeux de groupe").
            -   \`exploitableInterests\`: Les centres d'intérêt pouvant servir de levier (ex: "Passion pour les dinosaures", "Intérêt pour la musique").

        d.  **Difficultés (difficulties)**:
            -   \`cognitiveDifficulties\`: Les difficultés cognitives (ex: "Difficultés de planification", "Lenteur dans le traitement de l'information").
            -   \`schoolDifficulties\`: Les difficultés scolaires (ex: "Retard en lecture", "Difficultés en résolution de problèmes mathématiques").
            -   \`motorDifficulties\`: Les difficultés motrices (ex: "Difficultés en graphomotricité fine", "Déplacements lents et fatigants").
            -   \`socioEmotionalDifficulties\`: Les difficultés sociales et émotionnelles (ex: "Anxiété lors des transitions", "Gestion difficile de la frustration").
            -   \`disabilityConstraints\`: Les contraintes liées au handicap (ex: "Grande fatigabilité", "Nécessite des pauses fréquentes").

        e.  **Besoins (needs)**:
            -   \`pedagogicalAccommodations\`: Les aménagements pédagogiques recommandés (ex: "Fournir des supports visuels", "Adapter la quantité de travail écrit", "Utiliser une police d'écriture agrandie").
            -   \`humanAssistance\`: Le besoin d'aide humaine (ex: "Accompagnement par un(e) AESH", "Tutorat par un pair").
            -   \`compensatoryTools\`: Les outils de compensation à mettre en place (ex: "Ordinateur avec logiciel de synthèse vocale", "Calculatrice").
            -   \`specialEducationalApproach\`: Les approches éducatives spécifiques (ex: "Utiliser une communication par pictogrammes (PECS)", "Approche structurée de type TEACCH").
            -   \`complementaryCare\`: Les soins et rééducations (ex: "Séances d'orthophonie", "Suivi en psychomotricité", "SESSAD").
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

// We keep the old export for compatibility, but the main logic is now in gevasco-actions.ts
export async function extractGevascoData(input: ExtractGevascoInput): Promise<ExtractGevascoOutput> {
  return extractGevascoFlow(input);
}
