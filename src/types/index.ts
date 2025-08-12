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
  lastUpdate: string;
  status: 'active' | 'archived' | 'draft';
  avatarUrl: string;
  globalProfile?: GlobalProfile;
  strengths?: Strengths;
  difficulties?: Difficulties;
};

export type Ppi = {
  id: string;
  studentId: string;
  studentName: string;
  lastUpdate: string;
  status: 'validated' | 'draft' | 'archived';
};

export type LibraryItem = {
  id: string;
  text: string;
  category: 
    | 'needs' 
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
    | 'hobbies';
};

export type Classe = {
    id: string;
    name: string;
    teacherName: string;
};