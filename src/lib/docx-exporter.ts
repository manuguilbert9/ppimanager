
'use server';

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, VerticalAlign, WidthType } from 'docx';
import type { Student, Objective, FamilyContact } from '@/types';

function createSection(title: string, children: any[], pageBreak = true) {
    const section = [
        new Paragraph({
            children: [
                new TextRun({
                    text: title,
                    bold: true,
                    size: 32, // 16pt
                }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
        }),
        ...children,
    ];
    if (pageBreak) {
        section.push(new Paragraph({ children: [new PageBreak()] }));
    }
    return section;
}

function createSubHeading(text: string) {
    return new Paragraph({
        children: [
            new TextRun({
                text,
                bold: true,
                size: 28, // 14pt
            }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
    });
}

function createListItem(text: string) {
    return new Paragraph({
        text,
        bullet: {
            level: 0,
        },
        style: "default",
    });
}

function createParagraph(label: string, value?: string) {
    if (!value) return null;
    return new Paragraph({
        children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun(value),
        ],
        spacing: { after: 100 },
    });
}

function createTextareaContent(label: string, value?: string) {
    if (!value) return [];
    return [
        new Paragraph({
            children: [new TextRun({ text: label, bold: true, underline: {} })],
            spacing: { before: 200, after: 100 },
        }),
        ...value.split('\n').map(line => new Paragraph({ text: line, style: "default" })),
    ].filter(p => p !== null);
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
                        size: 24, // 12pt
                    },
                },
            ],
        },
        sections: [{
            properties: {},
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
                new Paragraph({
                    children: [new PageBreak()]
                }),

                // Part 2: Informations Administratives
                ...createSection('Informations Administratives', [
                    createSubHeading('Identité de l’élève'),
                    createParagraph('Nom', student.lastName),
                    createParagraph('Prénom', student.firstName),
                    createParagraph('Date de naissance', student.birthDate),
                    createParagraph('Sexe', student.sex),
                    createSubHeading('Scolarisation'),
                    createParagraph('Établissement', student.school),
                    createParagraph('Classe', student.className),
                    createParagraph('Niveau scolaire de référence', student.level),
                    createSubHeading('Notification MDPH'),
                    createParagraph('Intitulé', student.mdphNotificationTitle),
                    createParagraph('Date d\'expiration', student.mdphNotificationExpiration),
                    createSubHeading('Famille / Représentants légaux'),
                    ...(student.familyContacts || []).flatMap(contact => ([
                        createParagraph(contact.title, contact.name),
                        new Paragraph({ text: `    Adresse: ${contact.street || ''}, ${contact.postalCode || ''} ${contact.city || ''}`, style: "default"}),
                        new Paragraph({ text: `    Téléphone: ${contact.phone || ''}`, style: "default"}),
                        new Paragraph({ text: `    Email: ${contact.email || ''}`, style: "default", spacing: { after: 200 } }),
                    ])),
                ].filter(p => p !== null)),

                // Part 3: Profil Global
                ...createSection('Profil Global de l’élève', [
                    createSubHeading('Nature du handicap et troubles associés'),
                    new Paragraph({ children: [new TextRun({ text: "Diagnostics principaux", bold: true, underline: {} })] }),
                    ...(student.globalProfile?.disabilityNatures?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    new Paragraph({ children: [new TextRun({ text: "Autres troubles ou déficiences associées", bold: true, underline: {} })], spacing: {before: 200}}),
                    ...(student.globalProfile?.associatedDisorders?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    ...createTextareaContent('Spécificités (degré, latéralité, etc.)', student.globalProfile?.specifics),

                    createSubHeading('Santé et besoins médicaux'),
                    new Paragraph({ text: `PAI en place: ${student.globalProfile?.hasPAI ? 'Oui' : 'Non'}`, style: "default" }),
                    new Paragraph({ children: [new TextRun({ text: "Besoins médicaux spécifiques", bold: true, underline: {} })], spacing: {before: 200}}),
                    ...(student.globalProfile?.medicalNeeds?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    ...createTextareaContent('Traitements médicaux réguliers', student.globalProfile?.treatments),
                    new Paragraph({ children: [new TextRun({ text: "Appareillages", bold: true, underline: {} })], spacing: {before: 200}}),
                    ...(student.globalProfile?.equipment?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    
                    createSubHeading('Développement et autonomie'),
                    ...createTextareaContent('Autonomie dans les actes de la vie quotidienne', student.globalProfile?.dailyLifeAutonomy),
                    ...createTextareaContent('Compétences motrices', student.globalProfile?.motorSkills),
                    ...createTextareaContent('Capacités de communication', student.globalProfile?.communicationSkills),
                    ...createTextareaContent('Capacités sensorielles', student.globalProfile?.sensorySkills),

                    createSubHeading('Histoire scolaire et projet'),
                    ...createTextareaContent('Résumé du parcours scolaire antérieur', student.globalProfile?.schoolHistory),
                    new Paragraph({ children: [new TextRun({ text: "Centres d'intérêt et points de motivation", bold: true, underline: {} })], spacing: {before: 200}}),
                    ...(student.globalProfile?.hobbies?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    ...createTextareaContent('Esquisse du projet d’avenir ou professionnel', student.globalProfile?.personalProject),
                ].flat()),
                
                // Part 4 : Points d'appui
                ...createSection('Points d\'appui', [
                    createSubHeading('Compétences acquises'),
                    ...(student.strengths?.academicSkills?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Forces cognitives et comportementales'),
                    ...(student.strengths?.cognitiveStrengths?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Habiletés sociales ou communicationnelles préservées'),
                    ...(student.strengths?.socialSkills?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Intérêts spécifiques exploitables'),
                    ...(student.strengths?.exploitableInterests?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                ]),

                // Part 5: Difficultés
                ...createSection('Difficultés', [
                    createSubHeading('Difficultés cognitives'),
                    ...(student.difficulties?.cognitiveDifficulties?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Difficultés scolaires'),
                    ...(student.difficulties?.schoolDifficulties?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Difficultés motrices et fonctionnelles'),
                    ...(student.difficulties?.motorDifficulties?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Difficultés socio-émotionnelles ou comportementales'),
                    ...(student.difficulties?.socioEmotionalDifficulties?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Contraintes liées au handicap'),
                    ...(student.difficulties?.disabilityConstraints?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                ]),
                
                // Part 6: Besoins Éducatifs Particuliers
                ...createSection('Besoins Éducatifs Particuliers', [
                    createSubHeading('Besoin d’aménagements pédagogiques'),
                    ...(student.needs?.pedagogicalAccommodations?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Besoin d’aide humaine'),
                    ...(student.needs?.humanAssistance?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Besoin d’outils de compensation'),
                    ...(student.needs?.compensatoryTools?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Besoin en approche éducative particulière'),
                    ...(student.needs?.specialEducationalApproach?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                    createSubHeading('Besoin de soins ou rééducations complémentaires'),
                    ...(student.needs?.complementaryCare?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                ]),

                // Part 7: Objectifs
                ...createSection('Objectifs prioritaires d’apprentissage', (student.objectives || []).flatMap((objective, index) => [
                    new Paragraph({
                        children: [new TextRun({ text: `Objectif ${index + 1}: ${objective.title}`, bold: true, size: 28 })],
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400, after: 200 },
                    }),
                    createParagraph('Critère de réussite attendue', objective.successCriteria),
                    createParagraph('Échéance', objective.deadline),
                    new Paragraph({ children: [new TextRun({ text: "Moyens et adaptations", bold: true, underline: {} })], spacing: {before: 200}}),
                     ...(objective.adaptations?.map(item => createListItem(item)) || [createListItem("Non spécifié")]),
                ]), false), // No page break after the last section
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
}
