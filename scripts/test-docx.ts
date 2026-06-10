/**
 * Test manuel de l'export Word : génère un PPI complet pour un élève fictif.
 * Usage : npx esbuild scripts/test-docx.ts --bundle --platform=node --alias:@=./src --outfile=.tmp-test-docx.js && node .tmp-test-docx.js
 */
import { writeFileSync } from 'fs';
import { generateDocx } from '@/lib/docx-exporter';
import type { Student } from '@/types';

const student: Student = {
  id: 'test',
  firstName: 'Lina',
  lastName: 'Martin',
  birthDate: '12/03/2014',
  sex: 'female',
  school: 'IME Les Tilleuls',
  level: 'Cycle 2',
  mdphNotificationTitle: 'Orientation IME',
  mdphNotificationExpiration: '31/08/2027',
  familyContacts: [
    { title: 'Mère', name: 'Mme Martin', phone: '06 12 34 56 78', email: 'martin@example.com', street: '4 rue des Lilas', postalCode: '72000', city: 'Le Mans' },
  ],
  classId: 'c1',
  className: 'UE Papillons',
  teacherName: 'M. Guilbert',
  lastUpdate: '10/06/2026',
  ppiStatus: 'draft',
  avatarUrl: '',
  globalProfile: {
    disabilityNatures: ['Trouble du développement intellectuel'],
    associatedDisorders: ['Troubles attentionnels'],
    hasPAI: false,
    treatments: 'Aucun',
    dailyLifeAutonomy: 'Autonome pour les repas, aide pour l\'habillage fin.',
    communicationSkills: 'Langage oral présent, lexique réduit.',
    schoolHistory: 'Maternelle ordinaire avec AESH, entrée en IME en 2022.\nMaintien en GS.',
    careSupports: 'Orthophonie 2x/semaine, psychomotricité 1x/semaine.',
    schoolingTime: '4 demi-journées en UE, inclusion en arts plastiques.',
    hobbies: ['Animaux', 'Dessin'],
    personalProject: 'Aimerait travailler avec les animaux.',
    parentalProject: 'Famille investie, souhaite le développement de la lecture.',
  },
  strengths: {
    academicSkills: ['Reconnaît les lettres de l\'alphabet', 'Compte jusqu\'à 30'],
    cognitiveStrengths: ['Bonne mémoire visuelle'],
    socialSkills: ['Coopère volontiers en petit groupe'],
    exploitableInterests: ['Les animaux'],
  },
  difficulties: {
    cognitiveDifficulties: ['Mémoire de travail vite saturée'],
    schoolDifficulties: ['Combinatoire non acquise'],
    socioEmotionalDifficulties: ['Se décourage rapidement'],
  },
  needs: {
    pedagogicalAccommodations: ['Besoin de consignes simples et imagées'],
    compensatoryTools: ['Besoin de supports visuels de mémoire'],
  },
  troubleIds: ['tfc', 'tdah'],
  academicLevels: [
    { domain: 'Lecture', level: 'Cycle 2 – début CP', comment: 'Discrimine les syllabes simples.' },
    { domain: 'Nombres et calcul', level: 'Cycle 2 – CP', comment: 'Dénombre jusqu\'à 30.' },
  ],
  observations: {
    cognitif: {
      entries: {
        memoire: { facts: 'Oublie une consigne double dès la 2e étape.', needs: ['Besoin de supports de mémoire (agendas, guides, mémentos...)'] },
        attention: { facts: 'Attention soutenue 10 min le matin, 5 min l\'après-midi.', needs: ['Besoin de durée de travail aménagée (semaine, journée, activité)'] },
      },
      synthesis: 'Fatigabilité cognitive marquée, mémoire de travail limitée : séquencer et étayer.',
    },
    psychoaffectif: {
      entries: {
        'estime-de-soi': { facts: 'Dit « j\'y arrive pas » avant de commencer une tâche nouvelle.', needs: ['Besoin de reconnaissance de ses compétences'] },
      },
    },
  },
  priorityNeeds: [
    { id: '1', label: 'Besoin de supports de mémoire', domain: 'Le fonctionnement cognitif général', rationale: 'Conditionne tous les apprentissages.' },
    { id: '2', label: 'Besoin de reconnaissance de ses compétences', domain: 'Le fonctionnement psychoaffectif', rationale: 'Lève le blocage d\'entrée dans la tâche.' },
  ],
  objectives: [
    {
      id: 'o1',
      title: 'Lire des syllabes simples (consonne-voyelle) en autonomie',
      domain: 'Français – lecture',
      competenceRef: 'Identifier des mots de manière de plus en plus aisée (cycle 2)',
      means: ['Gestes Borel-Maisonny', 'Séances courtes quotidiennes'],
      adaptations: ['Support aéré, une ligne sur deux surlignée'],
      successCriteria: 'Lit 15 syllabes CV sans aide sur 20 présentées.',
      deadline: '15/12/2026',
      status: 'in_progress',
    },
  ],
  evaluationPlan: {
    modalities: 'Évaluation continue au fil des séances.',
    tools: ['Livret de réussite illustré'],
    communication: 'Point mensuel avec la famille.',
  },
  reviews: [
    { id: 'r1', date: '15/11/2026', progress: 'Lit 8 syllabes sur 20.', adjustments: 'Renforcer l\'entraînement quotidien.' },
  ],
};

async function main() {
  const blob = await generateDocx(student);
  const buffer = Buffer.from(await blob.arrayBuffer());
  writeFileSync('test-ppi.docx', buffer);
  console.log('OK — test-ppi.docx généré,', buffer.length, 'octets');
}

main().catch((e) => {
  console.error('ÉCHEC :', e);
  process.exit(1);
});
