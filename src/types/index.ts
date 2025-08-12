export type Student = {
  id: string;
  name: string;
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
