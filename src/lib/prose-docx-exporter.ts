
'use server';

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import type { Student } from '@/types';
import { generateStudentProse } from '@/ai/flows/generate-student-prose-flow';

export async function generateProseDocx(student: Student): Promise<Blob> {
    const proseResult = await generateStudentProse({
        firstName: student.firstName,
        strengths: student.strengths,
        difficulties: student.difficulties,
        needs: student.needs,
        globalProfile: student.globalProfile,
    });

    const proseParagraphs = proseResult.prose.split('\n').map(text => new Paragraph({
        text,
        style: "default",
    }));
    
    const objectivesParagraphs = (student.objectives || [])
        .filter(obj => !obj.validationDate)
        .map(obj => new Paragraph({
            text: obj.title,
            bullet: { level: 0 },
            style: "default",
        }));

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
                        font: "Calibri",
                    },
                    paragraph: {
                        spacing: { after: 120, line: 360 },
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
                    text: `Synthèse pour ${student.firstName} ${student.lastName}`,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                ...proseParagraphs,
                new Paragraph({
                    text: `Objectifs d'apprentissage prioritaires`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                }),
                ...objectivesParagraphs,
            ],
        }],
    });

    return Packer.toBlob(doc);
}
