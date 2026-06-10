/**
 * Export Word du Projet pédagogique individualisé (PPI).
 *
 * Structure du document conforme à la démarche d'élaboration du PPI
 * (B. Egron, « Enseigner en unité d'enseignement », Retz) :
 * recueil d'informations → profil → observation des fonctionnements →
 * besoins hiérarchisés → objectifs et moyens → évaluation et suivi.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  VerticalAlign,
  WidthType,
  ShadingType,
  BorderStyle,
  Footer,
  Header,
  PageNumber,
  TabStopType,
} from 'docx';
import type { Student, Objective, PriorityNeed } from '@/types';
import { getTroubles } from '@/lib/egron/troubles';
import { OBSERVATION_DOMAINS } from '@/lib/egron/observation-grid';

const FONT = 'Calibri';
const TABLE_WIDTH = 10000;

const COLORS = {
  primary: '1F4E79', // bleu profond
  primaryLight: 'D9E2F3',
  accent: '2E74B5',
  grayLight: 'F2F2F2',
  grayBorder: 'BFBFBF',
  white: 'FFFFFF',
  text: '262626',
  muted: '595959',
};

const THIN_BORDER = { style: BorderStyle.SINGLE, size: 4, color: COLORS.grayBorder };
const CELL_BORDERS = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER,
};
const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: COLORS.white },
  bottom: { style: BorderStyle.NONE, size: 0, color: COLORS.white },
  left: { style: BorderStyle.NONE, size: 0, color: COLORS.white },
  right: { style: BorderStyle.NONE, size: 0, color: COLORS.white },
};

const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

// ---------------------------------------------------------------------------
// Petits constructeurs
// ---------------------------------------------------------------------------

function run(text: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}): TextRun {
  return new TextRun({
    text,
    font: FONT,
    size: opts.size ?? 22, // 11 pt
    bold: opts.bold,
    italics: opts.italics,
    color: opts.color ?? COLORS.text,
  });
}

function para(text: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string; spacingAfter?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}): Paragraph {
  return new Paragraph({
    children: [run(text, opts)],
    spacing: { after: opts.spacingAfter ?? 80 },
    alignment: opts.alignment,
  });
}

function bullet(text: string, opts: { italics?: boolean; color?: string } = {}): Paragraph {
  return new Paragraph({
    children: [run(text, opts)],
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

/** Titre de section : bandeau plein. */
function sectionTitle(numero: string, title: string): Table {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  run(`${numero}  `, { bold: true, size: 28, color: COLORS.white }),
                  run(title.toUpperCase(), { bold: true, size: 28, color: COLORS.white }),
                ],
                spacing: { after: 0 },
              }),
            ],
            shading: { type: ShadingType.CLEAR, fill: COLORS.primary },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            borders: NO_BORDERS,
          }),
        ],
      }),
    ],
  });
}

/** Sous-titre dans une section. */
function subTitle(text: string): Paragraph {
  return new Paragraph({
    children: [run(text, { bold: true, size: 24, color: COLORS.accent })],
    spacing: { before: 240, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.accent, space: 2 },
    },
  });
}

function spacer(height = 120): Paragraph {
  return new Paragraph({ children: [], spacing: { after: height } });
}

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [para(text, { bold: true, color: COLORS.primary, spacingAfter: 0 })],
    shading: { type: ShadingType.CLEAR, fill: COLORS.primaryLight },
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    verticalAlign: VerticalAlign.CENTER,
    ...(width ? { width: { size: width, type: WidthType.DXA } } : {}),
  });
}

function bodyCell(content: (Paragraph | Table)[] | string, opts: { width?: number; fill?: string } = {}): TableCell {
  const children = typeof content === 'string' ? [para(content, { spacingAfter: 0 })] : content;
  return new TableCell({
    children: children.length > 0 ? children : [para('', { spacingAfter: 0 })],
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    verticalAlign: VerticalAlign.TOP,
    ...(opts.width ? { width: { size: opts.width, type: WidthType.DXA } } : {}),
    ...(opts.fill ? { shading: { type: ShadingType.CLEAR, fill: opts.fill } } : {}),
  });
}

/** Tableau « libellé : valeur » à deux colonnes. */
function infoTable(rows: [string, string | undefined | null][]): Table {
  const filtered = rows.filter(([, value]) => value && String(value).trim().length > 0);
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    rows: filtered.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [para(label, { bold: true, spacingAfter: 0 })],
              width: { size: 3000, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: COLORS.grayLight },
              borders: CELL_BORDERS,
              margins: CELL_MARGINS,
            }),
            bodyCell(String(value), { width: TABLE_WIDTH - 3000 }),
          ],
        })
    ),
  });
}

/** Bloc multi-lignes : libellé en gras puis texte (préserve les retours ligne). */
function textBlock(label: string, value?: string): Paragraph[] {
  if (!value || !value.trim()) return [];
  return [
    para(label, { bold: true, spacingAfter: 40 }),
    ...value.split('\n').filter((l) => l.trim()).map((line) => para(line, { spacingAfter: 40 })),
    spacer(60),
  ];
}

function bulletBlock(label: string, items?: string[]): Paragraph[] {
  const filtered = (items || []).filter((i) => i && i.trim().length > 0);
  if (filtered.length === 0) return [];
  return [para(label, { bold: true, spacingAfter: 40 }), ...filtered.map((i) => bullet(i)), spacer(60)];
}

// ---------------------------------------------------------------------------
// Page de garde
// ---------------------------------------------------------------------------

function coverPage(student: Student): (Paragraph | Table)[] {
  const year = new Date().getMonth() >= 7 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  return [
    spacer(1200),
    new Paragraph({
      children: [run('PROJET PÉDAGOGIQUE INDIVIDUALISÉ', { bold: true, size: 52, color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [run('PPI', { bold: true, size: 32, color: COLORS.accent })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Table({
      width: { size: 6000, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [run(`${student.firstName} ${student.lastName}`, { bold: true, size: 44, color: COLORS.white })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 0 },
                }),
              ],
              shading: { type: ShadingType.CLEAR, fill: COLORS.primary },
              margins: { top: 300, bottom: 300, left: 200, right: 200 },
              borders: NO_BORDERS,
            }),
          ],
        }),
      ],
    }),
    spacer(500),
    para(`Année scolaire ${year}-${year + 1}`, { size: 26, alignment: AlignmentType.CENTER, spacingAfter: 600 }),
    new Table({
      width: { size: 7000, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      rows: [
        ['Date de naissance', student.birthDate || '—'],
        ['Établissement', student.school || '—'],
        ['Classe / dispositif', student.className || '—'],
        ['Enseignant(e)', student.teacherName || '—'],
        ['Niveau de référence', student.level || '—'],
        ['Notification MDPH', student.mdphNotificationTitle || '—'],
      ].map(
        ([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                children: [para(label, { bold: true, spacingAfter: 0 })],
                width: { size: 3000, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: COLORS.primaryLight },
                borders: CELL_BORDERS,
                margins: CELL_MARGINS,
              }),
              new TableCell({
                children: [para(value, { spacingAfter: 0 })],
                width: { size: 4000, type: WidthType.DXA },
                borders: CELL_BORDERS,
                margins: CELL_MARGINS,
              }),
            ],
          })
      ),
    }),
    spacer(800),
    new Paragraph({
      children: [
        run(
          "Document de travail élaboré selon la démarche d'identification des besoins éducatifs particuliers ",
          { italics: true, size: 18, color: COLORS.muted }
        ),
        run("(B. Egron, Enseigner en unité d'enseignement, Retz).", { italics: true, size: 18, color: COLORS.muted }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        run('Document confidentiel — à diffuser uniquement aux membres de l\'équipe éducative et à la famille.', {
          italics: true,
          size: 18,
          color: COLORS.muted,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ];
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function administrativeSection(student: Student): (Paragraph | Table)[] {
  const translatedSex = student.sex === 'male' ? 'Masculin' : student.sex === 'female' ? 'Féminin' : student.sex ? 'Autre' : '';
  const children: (Paragraph | Table)[] = [
    sectionTitle('1', 'Renseignements administratifs'),
    spacer(),
    infoTable([
      ['Nom', student.lastName],
      ['Prénom', student.firstName],
      ['Date de naissance', student.birthDate],
      ['Sexe', translatedSex],
      ['Établissement', student.school],
      ['Classe / dispositif', student.className],
      ['Enseignant(e)', student.teacherName],
      ['Niveau scolaire de référence', student.level],
      ['Notification MDPH', student.mdphNotificationTitle],
      ['Échéance de la notification', student.mdphNotificationExpiration],
    ]),
  ];

  const contacts = student.familyContacts || [];
  if (contacts.length > 0) {
    children.push(subTitle('Famille / représentants légaux'));
    children.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [
          new TableRow({
            children: [
              headerCell('Qualité', 2000),
              headerCell('Nom', 2500),
              headerCell('Coordonnées', 3000),
              headerCell('Adresse', 2500),
            ],
          }),
          ...contacts.map(
            (c) =>
              new TableRow({
                children: [
                  bodyCell(c.title || '', { width: 2000 }),
                  bodyCell(c.name || '', { width: 2500 }),
                  bodyCell([c.phone, c.email].filter(Boolean).join('\n') || '', { width: 3000 }),
                  bodyCell([c.street, `${c.postalCode || ''} ${c.city || ''}`.trim()].filter(Boolean).join(', '), { width: 2500 }),
                ],
              })
          ),
        ],
      })
    );
  }

  return children;
}

function parcoursSection(student: Student): (Paragraph | Table)[] {
  const gp = student.globalProfile || {};
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    sectionTitle('2', 'Parcours scolaire et accompagnements'),
    spacer(),
    ...textBlock('Parcours scolaire antérieur', gp.schoolHistory),
    ...textBlock('Temps de scolarisation', gp.schoolingTime),
    ...textBlock('Suivis et prises en charge', gp.careSupports),
    ...textBlock('Projet parental pour l\'enfant', gp.parentalProject),
    ...textBlock('Projet personnel de l\'élève', gp.personalProject),
  ];
  return children;
}

function profilSection(student: Student): (Paragraph | Table)[] {
  const gp = student.globalProfile || {};
  const troubles = getTroubles(student.troubleIds || []);

  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    sectionTitle('3', "Profil de l'élève"),
    spacer(),
  ];

  // Troubles et incidences
  if (troubles.length > 0 || (gp.disabilityNatures || []).length > 0) {
    children.push(subTitle('Troubles et incidences sur les apprentissages'));
    if ((gp.disabilityNatures || []).length > 0) {
      children.push(...bulletBlock('Diagnostics principaux', gp.disabilityNatures));
    }
    if ((gp.associatedDisorders || []).length > 0) {
      children.push(...bulletBlock('Troubles ou déficiences associés', gp.associatedDisorders));
    }
    for (const trouble of troubles) {
      children.push(para(trouble.label, { bold: true, color: COLORS.accent, spacingAfter: 40 }));
      children.push(
        para('Principales incidences possibles sur les apprentissages :', { italics: true, color: COLORS.muted, spacingAfter: 40 })
      );
      // Limite aux 5 premières incidences pour garder un document lisible.
      children.push(...trouble.incidences.slice(0, 5).map((i) => bullet(i)));
      children.push(spacer(60));
    }
    if (gp.specifics) {
      children.push(...textBlock('Spécificités', gp.specifics));
    }
  }

  // Santé
  const hasSante = gp.hasPAI || (gp.medicalNeeds || []).length > 0 || gp.treatments || (gp.equipment || []).length > 0;
  if (hasSante) {
    children.push(subTitle('Santé et besoins médicaux'));
    children.push(
      infoTable([
        ['PAI en place', gp.hasPAI ? 'Oui' : 'Non'],
        ['Besoins médicaux', (gp.medicalNeeds || []).join(' ; ')],
        ['Traitements réguliers', gp.treatments],
        ['Appareillages', (gp.equipment || []).join(' ; ')],
      ])
    );
  }

  // Développement
  const hasDev = gp.dailyLifeAutonomy || gp.motorSkills || gp.communicationSkills || gp.sensorySkills;
  if (hasDev) {
    children.push(subTitle('Développement et autonomie'));
    children.push(...textBlock('Autonomie dans la vie quotidienne', gp.dailyLifeAutonomy));
    children.push(...textBlock('Compétences motrices', gp.motorSkills));
    children.push(...textBlock('Communication', gp.communicationSkills));
    children.push(...textBlock('Capacités sensorielles', gp.sensorySkills));
  }

  // Points d'appui / difficultés en deux colonnes
  const s = student.strengths || {};
  const d = student.difficulties || {};
  const strengthsItems = [
    ...bulletBlock('Compétences acquises', s.academicSkills),
    ...bulletBlock('Forces cognitives et comportementales', s.cognitiveStrengths),
    ...bulletBlock('Habiletés sociales', s.socialSkills),
    ...bulletBlock('Intérêts exploitables (leviers)', s.exploitableInterests),
    ...bulletBlock('Centres d\'intérêt', gp.hobbies),
  ];
  const difficultiesItems = [
    ...bulletBlock('Difficultés cognitives', d.cognitiveDifficulties),
    ...bulletBlock('Difficultés scolaires', d.schoolDifficulties),
    ...bulletBlock('Difficultés motrices et fonctionnelles', d.motorDifficulties),
    ...bulletBlock('Difficultés socio-émotionnelles', d.socioEmotionalDifficulties),
    ...bulletBlock('Contraintes liées au handicap', d.disabilityConstraints),
  ];

  if (strengthsItems.length > 0 || difficultiesItems.length > 0) {
    children.push(subTitle("Points d'appui et difficultés"));
    children.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [
          new TableRow({
            children: [headerCell("POINTS D'APPUI (leviers)", TABLE_WIDTH / 2), headerCell('DIFFICULTÉS (obstacles)', TABLE_WIDTH / 2)],
          }),
          new TableRow({
            children: [
              bodyCell(strengthsItems.length > 0 ? strengthsItems : [para('—', { spacingAfter: 0 })], { width: TABLE_WIDTH / 2 }),
              bodyCell(difficultiesItems.length > 0 ? difficultiesItems : [para('—', { spacingAfter: 0 })], { width: TABLE_WIDTH / 2 }),
            ],
          }),
        ],
      })
    );
  }

  return children;
}

function evaluationDiagnostiqueSection(student: Student): (Paragraph | Table)[] {
  const levels = (student.academicLevels || []).filter((l) => l.domain && l.domain.trim());
  if (levels.length === 0) return [];
  return [
    new Paragraph({ children: [new PageBreak()] }),
    sectionTitle('4', 'Évaluation diagnostique — niveaux scolaires'),
    spacer(),
    para(
      "Positionnement par domaine d'apprentissage, en référence aux programmes et au socle commun. Le profil peut être dysharmonique : l'élève peut relever de cycles différents selon les domaines.",
      { italics: true, color: COLORS.muted }
    ),
    spacer(60),
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [headerCell("Domaine d'apprentissage", 2800), headerCell('Niveau / cycle de référence', 2700), headerCell('Acquis et observations', 4500)],
        }),
        ...levels.map(
          (l) =>
            new TableRow({
              children: [
                bodyCell(l.domain, { width: 2800 }),
                bodyCell(l.level || '', { width: 2700 }),
                bodyCell(l.comment || '', { width: 4500 }),
              ],
            })
        ),
      ],
    }),
  ];
}

function observationSection(student: Student): (Paragraph | Table)[] {
  const observations = student.observations || {};
  const domainBlocks: (Paragraph | Table)[] = [];

  for (const domain of OBSERVATION_DOMAINS) {
    const data = observations[domain.id];
    if (!data) continue;

    const rows: TableRow[] = [];
    for (const item of domain.items) {
      const entry = data.entries?.[item.id];
      if (!entry) continue;
      const facts = entry.facts?.trim() || '';
      const needs = (entry.needs || []).filter((n) => n.trim());
      if (!facts && needs.length === 0) continue;
      rows.push(
        new TableRow({
          children: [
            bodyCell([para(item.label, { bold: true, spacingAfter: 0 })], { width: 2500, fill: COLORS.grayLight }),
            bodyCell(facts || '—', { width: 4200 }),
            bodyCell(needs.length > 0 ? needs.map((n) => bullet(n)) : [para('—', { spacingAfter: 0 })], { width: 3300 }),
          ],
        })
      );
    }

    const synthesis = data.synthesis?.trim();
    if (rows.length === 0 && !synthesis) continue;

    domainBlocks.push(subTitle(domain.title));
    if (rows.length > 0) {
      domainBlocks.push(
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          rows: [
            new TableRow({
              children: [headerCell('Item observé', 2500), headerCell('Faits observés', 4200), headerCell('Besoins repérés', 3300)],
            }),
            ...rows,
          ],
        })
      );
    }
    if (synthesis) {
      domainBlocks.push(spacer(60));
      domainBlocks.push(
        new Paragraph({
          children: [run('Synthèse : ', { bold: true, italics: true }), run(synthesis, { italics: true })],
          spacing: { after: 120 },
        })
      );
    }
  }

  if (domainBlocks.length === 0) return [];

  return [
    new Paragraph({ children: [new PageBreak()] }),
    sectionTitle('5', 'Observation des fonctionnements'),
    spacer(),
    para(
      "Synthèse de la grille d'observation : pour chaque champ de fonctionnement, les faits observés (sans jugement ni interprétation) et les besoins repérés.",
      { italics: true, color: COLORS.muted }
    ),
    ...domainBlocks,
  ];
}

function besoinsSection(student: Student): (Paragraph | Table)[] {
  const needs = student.needs || {};
  const priorityNeeds = (student.priorityNeeds || []).filter((n) => n.label && n.label.trim());

  const categoryBlocks = [
    ...bulletBlock("Besoin d'aménagements pédagogiques", needs.pedagogicalAccommodations),
    ...bulletBlock("Besoin d'aide humaine", needs.humanAssistance),
    ...bulletBlock("Besoin d'outils de compensation", needs.compensatoryTools),
    ...bulletBlock('Besoin en approche éducative particulière', needs.specialEducationalApproach),
    ...bulletBlock('Besoin de soins ou rééducations complémentaires', needs.complementaryCare),
  ];

  if (priorityNeeds.length === 0 && categoryBlocks.length === 0) return [];

  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    sectionTitle('6', 'Besoins éducatifs particuliers'),
    spacer(),
  ];

  if (priorityNeeds.length > 0) {
    children.push(subTitle('Besoins prioritaires retenus pour la période'));
    children.push(
      para(
        'Besoins hiérarchisés, du plus prioritaire au moins prioritaire. Ils fondent les objectifs de la section suivante.',
        { italics: true, color: COLORS.muted }
      )
    );
    children.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [
          new TableRow({
            children: [headerCell('N°', 600), headerCell('Besoin', 4400), headerCell('Champ', 2200), headerCell('Justification', 2800)],
          }),
          ...priorityNeeds.map(
            (n: PriorityNeed, i: number) =>
              new TableRow({
                children: [
                  bodyCell([para(String(i + 1), { bold: true, spacingAfter: 0, alignment: AlignmentType.CENTER })], { width: 600, fill: COLORS.primaryLight }),
                  bodyCell([para(n.label, { bold: true, spacingAfter: 0 })], { width: 4400 }),
                  bodyCell(n.domain || '', { width: 2200 }),
                  bodyCell(n.rationale || '', { width: 2800 }),
                ],
              })
          ),
        ],
      })
    );
  }

  if (categoryBlocks.length > 0) {
    children.push(subTitle('Ensemble des besoins identifiés'));
    children.push(...categoryBlocks);
  }

  return children;
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'En cours',
  achieved: 'Atteint',
  partial: 'Partiellement atteint',
  abandoned: 'Suspendu / révisé',
};

function objectiveBlock(objective: Objective, index: number): (Paragraph | Table)[] {
  const statusLabel = objective.validationDate
    ? `Atteint le ${objective.validationDate}`
    : STATUS_LABELS[objective.status || 'in_progress'];

  const rows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                run(`OBJECTIF ${index + 1} — `, { bold: true, color: COLORS.white }),
                run(objective.title, { bold: true, color: COLORS.white }),
              ],
              spacing: { after: 0 },
            }),
          ],
          shading: { type: ShadingType.CLEAR, fill: COLORS.accent },
          margins: CELL_MARGINS,
          borders: CELL_BORDERS,
          columnSpan: 2,
        }),
      ],
    }),
  ];

  const addRow = (label: string, content: (Paragraph | Table)[] | string) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [para(label, { bold: true, spacingAfter: 0 })],
            width: { size: 2800, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: COLORS.grayLight },
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
          }),
          bodyCell(content, { width: TABLE_WIDTH - 2800 }),
        ],
      })
    );
  };

  if (objective.domain) addRow("Domaine d'apprentissage", objective.domain);
  if (objective.competenceRef) addRow('Compétence visée (programmes / socle)', objective.competenceRef);
  const means = (objective.means || []).filter((m) => m.trim());
  if (means.length > 0) addRow('Démarches, moyens et supports', means.map((m) => bullet(m)));
  const adaptations = (objective.adaptations || []).filter((a) => a.trim());
  if (adaptations.length > 0) addRow('Adaptations', adaptations.map((a) => bullet(a)));
  if (objective.successCriteria) addRow('Critère de réussite', objective.successCriteria);
  addRow(
    'Échéance / statut',
    [objective.deadline ? `Échéance : ${objective.deadline}` : '', `Statut : ${statusLabel}`].filter(Boolean).join('   —   ')
  );
  if (objective.evaluation) addRow("Bilan de l'objectif", objective.evaluation);

  return [
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      rows,
    }),
    spacer(180),
  ];
}

function objectifsSection(student: Student): (Paragraph | Table)[] {
  const objectives = (student.objectives || []).filter((o) => o.title && o.title.trim());
  if (objectives.length === 0) return [];

  const active = objectives.filter((o) => !o.validationDate);
  const achieved = objectives.filter((o) => o.validationDate);

  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    sectionTitle('7', "Objectifs prioritaires d'apprentissage"),
    spacer(),
    para(
      "Objectifs référés aux programmes et au socle commun, choisis en fonction des besoins prioritaires de l'élève. Les objectifs ne sont pas modifiés : c'est le chemin pour les atteindre qui est individualisé (démarches, moyens, supports, adaptations).",
      { italics: true, color: COLORS.muted }
    ),
    spacer(60),
  ];

  active.forEach((o, i) => children.push(...objectiveBlock(o, i)));

  if (achieved.length > 0) {
    children.push(subTitle('Objectifs atteints'));
    achieved.forEach((o, i) => children.push(...objectiveBlock(o, active.length + i)));
  }

  return children;
}

function suiviSection(student: Student): (Paragraph | Table)[] {
  const plan = student.evaluationPlan || {};
  const reviews = (student.reviews || []).filter((r) => r.date || r.progress || r.adjustments);

  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    sectionTitle('8', 'Évaluation des progrès et suivi du projet'),
    spacer(),
  ];

  const hasPlan = plan.modalities || (plan.tools || []).length > 0 || plan.communication;
  if (hasPlan) {
    children.push(subTitle("Modalités d'évaluation"));
    children.push(...textBlock("Modalités d'évaluation retenues", plan.modalities));
    children.push(...bulletBlock('Outils de capitalisation des progrès', plan.tools));
    children.push(...textBlock("Communication des progrès à l'élève et à la famille", plan.communication));
  } else {
    children.push(
      para(
        "Principes : évaluation continue au fil des acquisitions ; détacher l'évaluation du travail de celle de la personne ; n'évaluer que les compétences acquises ; pointer régulièrement les progrès et les capitaliser ; les communiquer dans un vocabulaire compréhensible par l'élève et la famille.",
        { italics: true, color: COLORS.muted }
      )
    );
  }

  children.push(subTitle('Bilans périodiques'));
  if (reviews.length > 0) {
    children.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [
          new TableRow({
            children: [headerCell('Date', 1600), headerCell('Progrès observés', 4200), headerCell('Ajustements décidés', 4200)],
          }),
          ...reviews.map(
            (r) =>
              new TableRow({
                children: [
                  bodyCell(r.date || '', { width: 1600 }),
                  bodyCell(r.progress || '', { width: 4200 }),
                  bodyCell(r.adjustments || '', { width: 4200 }),
                ],
              })
          ),
        ],
      })
    );
  } else {
    // Tableau vierge à compléter lors des points d'étape.
    children.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [
          new TableRow({
            children: [headerCell('Date', 1600), headerCell('Progrès observés', 4200), headerCell('Ajustements décidés', 4200)],
          }),
          ...[0, 1, 2].map(
            () =>
              new TableRow({
                children: [
                  bodyCell([spacer(400)], { width: 1600 }),
                  bodyCell([spacer(400)], { width: 4200 }),
                  bodyCell([spacer(400)], { width: 4200 }),
                ],
              })
          ),
        ],
      })
    );
  }

  return children;
}

function signaturesSection(): (Paragraph | Table)[] {
  const signatureCell = (label: string) =>
    new TableCell({
      children: [para(label, { bold: true, spacingAfter: 60 }), para('Date :', { color: COLORS.muted, spacingAfter: 400 }), para('Signature :', { color: COLORS.muted, spacingAfter: 600 })],
      borders: CELL_BORDERS,
      margins: CELL_MARGINS,
      width: { size: TABLE_WIDTH / 3, type: WidthType.DXA },
    });

  return [
    spacer(300),
    sectionTitle('9', 'Validation du projet'),
    spacer(),
    para(
      "Le PPI est présenté et explicité à la famille et à l'élève. Il est révisé à chaque bilan périodique.",
      { italics: true, color: COLORS.muted }
    ),
    spacer(60),
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [signatureCell("L'enseignant(e)"), signatureCell('La famille / les représentants légaux'), signatureCell('La direction'),],
        }),
      ],
    }),
  ];
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export async function generateDocx(student: Student): Promise<Blob> {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22, color: COLORS.text },
        },
      },
    },
    sections: [
      {
        properties: {
          titlePage: true,
          page: {
            margin: { top: 850, right: 850, bottom: 850, left: 850 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TABLE_WIDTH }],
                children: [
                  run(`PPI — ${student.firstName} ${student.lastName}`, { size: 16, color: COLORS.muted }),
                  new TextRun({ text: '\tConfidentiel', font: FONT, size: 16, color: COLORS.muted, italics: true }),
                ],
                border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.grayBorder, space: 2 } },
              }),
            ],
          }),
          first: new Header({ children: [] }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: ['Page ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: COLORS.muted }),
                ],
              }),
            ],
          }),
          first: new Footer({ children: [] }),
        },
        children: [
          ...coverPage(student),
          new Paragraph({ children: [new PageBreak()] }),
          ...administrativeSection(student),
          ...parcoursSection(student),
          ...profilSection(student),
          ...evaluationDiagnostiqueSection(student),
          ...observationSection(student),
          ...besoinsSection(student),
          ...objectifsSection(student),
          ...suiviSection(student),
          ...signaturesSection(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
