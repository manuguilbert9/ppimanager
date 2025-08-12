export type Student = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  sex?: 'male' | 'female' | 'other';
  school?: string;
  level?: string;
  mdphNotification?: string;
  admissionDate?: string;
  reviewDate?: string;
  referents?: string; // enseignants, éducateurs, etc.
  familyContacts?: string;
  parentalAuthority?: string;
  classId: string;
  className: string; // To avoid joins on list pages
  lastUpdate: string;
  status: 'active' | 'archived' | 'draft';
  avatarUrl: string;
};

export type Ppi = {
  id: string;
  studentName: string;
  lastUpdate: string;
  status: 'validated' | 'draft' | 'archived';
};

export type LibraryItem = {
  id: string;
  text: string;
  category: 'needs' | 'objectives' | 'adaptations' | 'indicators';
};

export type Classe = {
    id: string;
    name: string;
};
