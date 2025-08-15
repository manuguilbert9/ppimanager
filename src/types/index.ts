

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

export type Objective = {
  id?: string;
  title: string;
  adaptations?: string[];
  successCriteria?: string;
  deadline?: string;
  validationDate?: string;
};

export type PpiStatus = 'draft' | 'validated' | 'archived';

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
  lastUpdateDate?: Date; // For sorting purposes, not stored in Firestore
  ppiStatus: PpiStatus;
  avatarUrl: string;
  globalProfile?: GlobalProfile;
  strengths?: Strengths;
  difficulties?: Difficulties;
  needs?: Needs;
  objectives?: Objective[];
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
