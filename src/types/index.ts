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
  disabilityNature?: string;
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
}

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
  category: 'needs' | 'objectives' | 'adaptations' | 'indicators' | 'disabilityNatures' | 'associatedDisorders' | 'equipments' | 'hobbies' | 'medicalNeeds';
};

export type Classe = {
    id: string;
    name: string;
    teacherName: string;
};
