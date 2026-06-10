

import type { StudentObjectiveGroup } from "@/ai/flows/group-objectives-flow";

export type FamilyContact = {
  id?: string;
  title: string;
  name: string;
  street?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
};

export type GlobalProfile = {
  disabilityNatures?: string[];
  associatedDisorders?: string[];
  specifics?: string;
  hasPAI?: boolean;
  medicalNeeds?: string[];
  treatments?: string;
  equipment?: string[];
  dailyLifeAutonomy?: string;
  motorSkills?: string;
  communicationSkills?: string;
  sensorySkills?: string;
  schoolHistory?: string;
  hobbies?: string[];
  personalProject?: string;
  /** Projet parental pour l'enfant (regard de la famille, attentes). */
  parentalProject?: string;
  /** Suivis et prises en charge (orthophonie, SESSAD, CMP...). */
  careSupports?: string;
  /** Temps de scolarisation (hebdomadaire, inclusions...). */
  schoolingTime?: string;
};

export type Strengths = {
  academicSkills?: string[];
  cognitiveStrengths?: string[];
  socialSkills?: string[];
  exploitableInterests?: string[];
}

export type Difficulties = {
  cognitiveDifficulties?: string[];
  schoolDifficulties?: string[];
  motorDifficulties?: string[];
  socioEmotionalDifficulties?: string[];
  disabilityConstraints?: string[];
};

export type Needs = {
  pedagogicalAccommodations?: string[];
  humanAssistance?: string[];
  compensatoryTools?: string[];
  specialEducationalApproach?: string[];
  complementaryCare?: string[];
};

/**
 * Observation d'un item de la grille des fonctionnements (démarche Egron) :
 * des faits observés (sans jugement ni interprétation) et les besoins
 * éventuels identifiés à partir de ces faits.
 */
export type ObservationEntry = {
  facts?: string;
  needs?: string[];
};

/** Observations d'un champ de fonctionnement (ex. : psychoaffectif). */
export type DomainObservation = {
  /** Entrées par item de la grille (clé = id de l'item). */
  entries?: Record<string, ObservationEntry>;
  /** Synthèse / analyse du champ, rédigée après l'observation. */
  synthesis?: string;
};

/** Ensemble des observations, clé = id du champ de la grille. */
export type Observations = Record<string, DomainObservation>;

/**
 * Besoin éducatif prioritaire retenu après hiérarchisation.
 * « Tous les besoins ne sont pas d'un même niveau, il est nécessaire de
 * faire des choix parmi ceux-ci. » (B. Egron, chap. 13)
 */
export type PriorityNeed = {
  id: string;
  label: string;
  /** Champ de fonctionnement d'origine (titre lisible). */
  domain?: string;
  /** Pourquoi ce besoin est prioritaire pour cet élève. */
  rationale?: string;
};

/** Niveau scolaire par domaine d'apprentissage (évaluation diagnostique). */
export type AcademicLevel = {
  id?: string;
  domain: string;
  /** Niveau ou cycle de référence (ex. : « cycle 2, mi-CE1 »). */
  level?: string;
  comment?: string;
};

export type ObjectiveStatus = 'in_progress' | 'achieved' | 'partial' | 'abandoned';

export type Objective = {
  id?: string;
  title: string;
  /** Domaine d'apprentissage (discipline ou transversal). */
  domain?: string;
  /** Référence aux programmes / socle commun. */
  competenceRef?: string;
  /** Démarches, moyens, supports pour atteindre l'objectif. */
  means?: string[];
  adaptations?: string[];
  successCriteria?: string;
  deadline?: string;
  validationDate?: string;
  status?: ObjectiveStatus;
  /** Bilan / évaluation de l'objectif. */
  evaluation?: string;
};

/** Bilan périodique du PPI (régulation de la démarche). */
export type PpiReview = {
  id?: string;
  date?: string;
  /** Progrès observés depuis le dernier bilan. */
  progress?: string;
  /** Ajustements décidés (objectifs, moyens, adaptations). */
  adjustments?: string;
};

/** Modalités d'évaluation et de communication des progrès (chap. 16). */
export type EvaluationPlan = {
  /** Modalités : évaluation continue, formative, au fil des activités... */
  modalities?: string;
  /** Outils : portefeuille de compétences, livret de réussite... */
  tools?: string[];
  /** Communication des progrès à l'élève et à la famille. */
  communication?: string;
};

export type PpiStatus = 'draft' | 'validated' | 'archived' | 'to_create';

export type Student = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  sex?: 'male' | 'female' | 'other';
  school?: string;
  level?: string;
  mdphNotificationTitle?: string;
  mdphNotificationExpiration?: string;
  familyContacts: FamilyContact[];
  classId: string;
  className: string; // To avoid joins on list pages
  teacherName: string; // To avoid joins on list pages
  lastUpdate: string;
  lastUpdateTimestamp?: number; // For sorting purposes, not stored in Firestore
  ppiStatus: PpiStatus;
  avatarUrl: string;
  globalProfile?: GlobalProfile;
  strengths?: Strengths;
  difficulties?: Difficulties;
  needs?: Needs;
  objectives?: Objective[];
  notes?: string;
  /** Troubles identifiés, référencés au référentiel Egron (ids). */
  troubleIds?: string[];
  /** Niveaux scolaires par domaine (évaluation diagnostique). */
  academicLevels?: AcademicLevel[];
  /** Grille d'observation des fonctionnements (démarche Egron, chap. 13). */
  observations?: Observations;
  /** Besoins éducatifs prioritaires, hiérarchisés. */
  priorityNeeds?: PriorityNeed[];
  /** Modalités d'évaluation et de suivi (chap. 16). */
  evaluationPlan?: EvaluationPlan;
  /** Bilans périodiques du PPI. */
  reviews?: PpiReview[];
};

export type Ppi = {
  id: string;
  studentId: string;
  studentName: string;
  lastUpdate: string;
  status: PpiStatus;
};

export type LibraryItem = {
  id: string;
  text: string;
  category: 
    | 'objectives' 
    | 'adaptations' 
    | 'indicators'
    // Strengths
    | 'academicSkills' 
    | 'cognitiveStrengths' 
    | 'socialSkills' 
    | 'exploitableInterests'
    // Difficulties
    | 'cognitiveDifficulties'
    | 'schoolDifficulties'
    | 'motorDifficulties'
    | 'socioEmotionalDifficulties'
    | 'disabilityConstraints'
    // Global Profile
    | 'disabilityNatures'
    | 'associatedDisorders'
    | 'medicalNeeds'
    | 'equipment'
    | 'hobbies'
    // Needs
    | 'pedagogicalAccommodations'
    | 'humanAssistance'
    | 'compensatoryTools'
    | 'specialEducationalApproach'
    | 'complementaryCare';
};

export type Classe = {
    id: string;
    name: string;
    teacherName: string;
};

export type GroupStudent = {
    id: string;
    name: string;
    objectiveTitle: string;
    deadline?: string;
};

export type Group = {
    id: string;
    groupTitle: string;
    rationale: string;
    students: GroupStudent[];
    createdAt: string;
};

export interface ImportedStudent {
  firstName: string;
  lastName: string;
  birthDate?: string;
  className: string;
}
