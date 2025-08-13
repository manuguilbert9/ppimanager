import { z } from 'zod';

export const ExtractedFamilyContactSchema = z.object({
  title: z.string().optional().describe("Le titre du contact, ex: 'Mme', 'M.'"),
  name: z.string().optional().describe("Le nom complet du contact."),
  phone: z.string().optional().describe("Le numéro de téléphone."),
  email: z.string().optional().describe("L'adresse email."),
  street: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
});
export type ExtractedFamilyContact = z.infer<typeof ExtractedFamilyContactSchema>;


export const ExtractedDataSchema = z.object({
  firstName: z.string().optional().describe("Le prénom de l'élève."),
  lastName: z.string().optional().describe("Le nom de famille de l'élève."),
  birthDate: z.string().optional().describe("La date de naissance de l'élève."),
  school: z.string().optional().describe("L'établissement scolaire de l'élève."),
  level: z.string().optional().describe("Le niveau scolaire de l'élève."),
  familyContacts: z.array(ExtractedFamilyContactSchema).optional().describe("La liste des contacts familiaux."),

  globalProfile: z.object({
    disabilityNatures: z.array(z.string()).optional().describe("Diagnostics principaux, nature du handicap."),
    associatedDisorders: z.array(z.string()).optional().describe("Troubles associés."),
    medicalNeeds: z.array(z.string()).optional().describe("Besoins médicaux spécifiques, suivis (kiné, ortho...)."),
    motorSkills: z.string().optional().describe("Description des compétences motrices."),
    communicationSkills: z.string().optional().describe("Description des capacités de communication."),
    hobbies: z.array(z.string()).optional().describe("Centres d'intérêt et points de motivation."),
  }).optional(),
  
  strengths: z.object({
    academicSkills: z.array(z.string()).optional().describe("Les compétences scolaires acquises."),
    cognitiveStrengths: z.array(z.string()).optional().describe("Les forces cognitives et comportementales."),
    socialSkills: z.array(z.string()).optional().describe("Les habiletés sociales et de communication."),
    exploitableInterests: z.array(z.string()).optional().describe("Les intérêts spécifiques sur lesquels s'appuyer."),
  }).optional(),

  difficulties: z.object({
    cognitiveDifficulties: z.array(z.string()).optional().describe("Les difficultés d'ordre cognitif."),
    schoolDifficulties: z.array(z.string()).optional().describe("Les difficultés rencontrées dans le cadre scolaire."),
    motorDifficulties: z.array(z.string()).optional().describe("Les difficultés motrices et fonctionnelles."),
    socioEmotionalDifficulties: z.array(z.string()).optional().describe("Les difficultés d'ordre socio-émotionnel ou comportemental."),
  }).optional(),
});

export type ExtractedData = z.infer<typeof ExtractedDataSchema>;
