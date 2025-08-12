import type { Student, Ppi } from '@/types';

export const students: Student[] = [
  {
    id: '1',
    name: 'Alice Dubois',
    class: 'CE2',
    lastUpdate: '2024-05-10',
    status: 'active',
    avatarUrl: 'https://placehold.co/40x40.png',
  },
  {
    id: '2',
    name: 'Benjamin Martin',
    class: 'CM1',
    lastUpdate: '2024-05-12',
    status: 'active',
    avatarUrl: 'https://placehold.co/40x40.png',
  },
  {
    id: '3',
    name: 'Chloé Bernard',
    class: 'CE1',
    lastUpdate: '2024-04-28',
    status: 'draft',
    avatarUrl: 'https://placehold.co/40x40.png',
  },
  {
    id: '4',
    name: 'David Garcia',
    class: 'CM2',
    lastUpdate: '2023-11-20',
    status: 'archived',
    avatarUrl: 'https://placehold.co/40x40.png',
  },
  {
    id: '5',
    name: 'Eva Leroy',
    class: 'CE2',
    lastUpdate: '2024-05-15',
    status: 'active',
    avatarUrl: 'https://placehold.co/40x40.png',
  },
];

export const ppis: Ppi[] = [
  {
    id: 'ppi-1',
    studentName: 'Alice Dubois',
    lastUpdate: '2024-05-10',
    status: 'validated',
  },
  {
    id: 'ppi-2',
    studentName: 'Benjamin Martin',
    lastUpdate: '2024-05-12',
    status: 'draft',
  },
  {
    id: 'ppi-3',
    studentName: 'Eva Leroy',
    lastUpdate: '2024-05-15',
    status: 'validated',
  },
];
