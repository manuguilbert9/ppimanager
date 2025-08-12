
'use server';

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, VerticalAlign, WidthType, ShadingType, ITableCellMarginOptions, IShadingAttributes, PageOrientation } from 'docx';
import type { Student } from '@/types';

const TABLE_WIDTH = 9000;
const FULL_WIDTH = {
    size: TABLE_WIDTH,
    type: WidthType.DXA,
};
const TWO_COL_WIDTHS = [TABLE_WIDTH * 0.3, TABLE_WIDTH * 0.7];

const NO_BORDER = {
    top: { style: "none", size: 0, color: "FFFFFF" },
    bottom: { style: "none", size: 0, color: "FFFFFF" },
    left: { style: "none", size: 0, color: "FFFFFF" },
    right: { style: "none", size: 0, color: "FFFFFF" },
};

// New color palette
const SECTION_COLORS = {
    administrative: "c8dee9",
    globalProfile: "E6E5C5",
    strengths: "b4e2cc",
    difficulties: "e4c9c9",
    needs: "d0ebe8",
    objectives: "abb3dd",
};


function createSectionTitle(title: string, color: string, textColor = "000000"): TableRow {
    return new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({
                        text: title,
                        bold: true,
                        size: 32, // 16pt
                        color: textColor,
                    })],
                    alignment: AlignmentType.CENTER,
                })],
                shading: {
                    type: ShadingType.SOLID,
                    color: color,
                    fill: color,
                },
                verticalAlign: VerticalAlign.CENTER,
                columnSpan: 2,
                margins: { top: 200, bottom: 200 },
            }),
        ],
    });
}

function createSubHeadingRow(text: string): TableRow {
    return new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({
                        text,
                        bold: true,
                        size: 28, // 14pt
                        color: "444444",
                    })],
                })],
                columnSpan: 2,
                margins: { top: 300, bottom: 100 },
                borders: NO_BORDER,
            }),
        ],
    });
}

function createDataRow(label: string, value?: string): TableRow | null {
    if (!value) return null;
    return new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: label, bold: true })],
                    style: "default",
                })],
                verticalAlign: VerticalAlign.TOP,
                borders: NO_BORDER,
                width: { size: TWO_COL_WIDTHS[0], type: WidthType.DXA },
            }),
            new TableCell({
                children: [new Paragraph({ text: value, style: "default" })],
                verticalAlign: VerticalAlign.TOP,
                borders: NO_BORDER,
                width: { size: TWO_COL_WIDTHS[1], type: WidthType.DXA },
            }),
        ],
    });
}

function createListRow(label: string, items?: string[]): TableRow[] {
    if (!items || items.length === 0) {
        return [];
    }
        
    const content = items.map(item => new Paragraph({ text: item, bullet: { level: 0 }, style: "default" }));
        
    return [
        new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: label, bold: true, underline: {} })],
                        style: "default",
                    })],
                    columnSpan: 2,
                    borders: NO_BORDER,
                    margins: { top: 200, bottom: 50 },
                }),
            ],
        }),
        new TableRow({
            children: [
                 new TableCell({
                    children: content,
                    columnSpan: 2,
                    borders: NO_BORDER,
                    margins: { left: 400 },
                }),
            ]
        })
    ];
}

function createTextareaRow(label: string, value?: string): TableRow[] {
    if (!value || !value.trim()) {
        return [];
    }

    const content = value.split('\n').map(line => new Paragraph({ text: line, style: "default" }));
        
     return [
        new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: label, bold: true, underline: {} })],
                        style: "default",
                    })],
                    columnSpan: 2,
                    borders: NO_BORDER,
                    margins: { top: 200, bottom: 50 },
                }),
            ],
        }),
        new TableRow({
            children: [
                 new TableCell({
                    children: content,
                    columnSpan: 2,
                    borders: NO_BORDER,
                    margins: { left: 200 },
                }),
            ]
        })
    ];
}

function createSpacerRow(): TableRow {
    return new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph("")],
                columnSpan: 2,
                borders: NO_BORDER
            }),
        ],
    });
}


function createSection(title: string, color: string, rows: (TableRow | null | (TableRow | null)[])[], pageBreakBefore = true) {
    const tableRows = [
        createSectionTitle(title, color, "FFFFFF"),
        ...rows.flat().filter((row): row is TableRow => row !== null),
    ];

    const sectionChildren: (Table | Paragraph)[] = [
        new Table({
            rows: tableRows,
            width: FULL_WIDTH,
        })
    ];
    
    if (pageBreakBefore) {
        sectionChildren.unshift(new Paragraph({ children: [new PageBreak()] }));
    }
    
    return sectionChildren;
}


export async function generateDocx(student: Student): Promise<Blob> {
    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "default",
                    name: "Default",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 22, // 11pt
                        font: "Calibri",
                    },
                    paragraph: {
                        spacing: { after: 100 },
                    }
                },
            ],
        },
        sections: [{
            properties: {
                 page: {
                    margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch margins
                 },
            },
            children: [
                // Part 1: Page de Garde
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Projet Personnalisé d\'Inclusion (PPI)',
                            bold: true,
                            size: 48, // 24pt
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${student.firstName} ${student.lastName}`,
                            bold: true,
                            size: 60, // 30pt
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 },
                }),
                new Paragraph({
                    text: `Année scolaire: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                    alignment: AlignmentType.CENTER,
                    style: "default",
                }),
                new Paragraph({
                    text: `Établissement: ${student.school || 'Non spécifié'}`,
                    alignment: AlignmentType.CENTER,
                    style: "default",
                }),

                // Part 2: Informations Administratives
                ...createSection('Informations Administratives', SECTION_COLORS.administrative, [
                    createSubHeadingRow('Identité de l’élève'),
                    createDataRow('Nom', student.lastName),
                    createDataRow('Prénom', student.firstName),
                    createDataRow('Date de naissance', student.birthDate),
                    createDataRow('Sexe', student.sex),
                    createSpacerRow(),
                    createSubHeadingRow('Scolarisation'),
                    createDataRow('Établissement', student.school),
                    createDataRow('Classe', student.className),
                    createDataRow('Niveau scolaire de référence', student.level),
                    createSpacerRow(),
                    createSubHeadingRow('Notification MDPH'),
                    createDataRow('Intitulé', student.mdphNotificationTitle),
                    createDataRow('Date d\'expiration', student.mdphNotificationExpiration),
                    createSpacerRow(),
                    createSubHeadingRow('Famille / Représentants légaux'),
                    ...(student.familyContacts || []).flatMap(contact => [
                        createDataRow(contact.title, contact.name),
                        createDataRow("    Adresse", `${contact.street || ''}, ${contact.postalCode || ''} ${contact.city || ''}`),
                        createDataRow("    Téléphone", contact.phone),
                        createDataRow("    Email", contact.email),
                        createSpacerRow(),
                    ]),
                ]),

                // Part 3: Profil Global
                ...createSection('Profil Global de l’élève', SECTION_COLORS.globalProfile, [
                    createSubHeadingRow('Nature du handicap et troubles associés'),
                    ...createListRow("Diagnostics principaux", student.globalProfile?.disabilityNatures),
                    ...createListRow("Autres troubles ou déficiences associées", student.globalProfile?.associatedDisorders),
                    ...createTextareaRow('Spécificités (degré, latéralité, etc.)', student.globalProfile?.specifics),
                    createSpacerRow(),
                    createSubHeadingRow('Santé et besoins médicaux'),
                    createDataRow("PAI en place", student.globalProfile?.hasPAI ? 'Oui' : 'Non'),
                    ...createListRow("Besoins médicaux spécifiques", student.globalProfile?.medicalNeeds),
                    ...createTextareaRow('Traitements médicaux réguliers', student.globalProfile?.treatments),
                    ...createListRow("Appareillages", student.globalProfile?.equipment),
                    createSpacerRow(),
                    createSubHeadingRow('Développement et autonomie'),
                    ...createTextareaRow('Autonomie dans les actes de la vie quotidienne', student.globalProfile?.dailyLifeAutonomy),
                    ...createTextareaRow('Compétences motrices', student.globalProfile?.motorSkills),
                    ...createTextareaRow('Capacités de communication', student.globalProfile?.communicationSkills),
                    ...createTextareaRow('Capacités sensorielles', student.globalProfile?.sensorySkills),
                    createSpacerRow(),
                    createSubHeadingRow('Histoire scolaire et projet'),
                    ...createTextareaRow('Résumé du parcours scolaire antérieur', student.globalProfile?.schoolHistory),
                    ...createListRow("Centres d'intérêt et points de motivation", student.globalProfile?.hobbies),
                    ...createTextareaRow('Esquisse du projet d’avenir ou professionnel', student.globalProfile?.personalProject),
                ]),
                
                // Part 4 : Points d'appui
                ...createSection("Points d'appui", SECTION_COLORS.strengths, [
                    ...createListRow('Compétences acquises', student.strengths?.academicSkills),
                    ...createListRow('Forces cognitives et comportementales', student.strengths?.cognitiveStrengths),
                    ...createListRow('Habiletés sociales ou communicationnelles', student.strengths?.socialSkills),
                    ...createListRow('Intérêts spécifiques exploitables', student.strengths?.exploitableInterests),
                ]),

                // Part 5: Difficultés
                ...createSection('Difficultés', SECTION_COLORS.difficulties, [
                     ...createListRow('Difficultés cognitives', student.difficulties?.cognitiveDifficulties),
                     ...createListRow('Difficultés scolaires', student.difficulties?.schoolDifficulties),
                     ...createListRow('Difficultés motrices et fonctionnelles', student.difficulties?.motorDifficulties),
                     ...createListRow('Difficultés socio-émotionnelles ou comportementales', student.difficulties?.socioEmotionalDifficulties),
                     ...createListRow('Contraintes liées au handicap', student.difficulties?.disabilityConstraints),
                ]),
                
                // Part 6: Besoins Éducatifs Particuliers
                ...createSection('Besoins Éducatifs Particuliers', SECTION_COLORS.needs, [
                     ...createListRow('Besoin d’aménagements pédagogiques', student.needs?.pedagogicalAccommodations),
                     ...createListRow('Besoin d’aide humaine', student.needs?.humanAssistance),
                     ...createListRow('Besoin d’outils de compensation', student.needs?.compensatoryTools),
                     ...createListRow('Besoin en approche éducative particulière', student.needs?.specialEducationalApproach),
                     ...createListRow('Besoin de soins ou rééducations complémentaires', student.needs?.complementaryCare),
                ]),

                // Part 7: Objectifs
                ...createSection('Objectifs prioritaires d’apprentissage', SECTION_COLORS.objectives, (student.objectives || []).flatMap((objective, index) => [
                    createSubHeadingRow(`Objectif ${index + 1}: ${objective.title}`),
                    createDataRow('Critère de réussite attendue', objective.successCriteria),
                    createDataRow('Échéance', objective.deadline),
                    ...createListRow("Moyens et adaptations", objective.adaptations),
                    createSpacerRow(),
                ])),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
}

    