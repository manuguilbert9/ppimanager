
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign } from 'docx';
import type { Group } from '@/types';

const TABLE_WIDTH = 9000;
const FULL_WIDTH = { size: TABLE_WIDTH, type: WidthType.DXA };

const NO_BORDER = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

export async function generateGroupDocx(group: Group): Promise<Blob> {
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
                        spacing: { after: 100, before: 100 },
                    }
                },
            ],
        },
        sections: [{
            properties: {
                 page: {
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch margins
                 },
            },
            children: [
                new Paragraph({
                    text: group.groupTitle,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Justification : ", bold: true }),
                        new TextRun(group.rationale),
                    ],
                    style: "default",
                    spacing: { after: 400 },
                }),
                new Table({
                    width: FULL_WIDTH,
                    rows: [
                        new TableRow({
                            tableHeader: true,
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Élève", alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "Objectif Spécifique", alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "Échéance", alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                            ],
                        }),
                        ...group.students.map(student => new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(student.name)], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph(student.objectiveTitle)], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph(student.deadline || 'N/A')], verticalAlign: VerticalAlign.CENTER }),
                            ],
                        })),
                    ],
                }),
            ],
        }],
    });

    return Packer.toBlob(doc);
}
