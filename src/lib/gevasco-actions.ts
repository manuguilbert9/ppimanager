
'use server';

import { extractGevascoData, ExtractGevascoOutput } from '@/ai/flows/extract-gevasco-flow';
import { getStudent, updateStudent } from './students-repository';
import type { Student } from '@/types';
import { revalidatePath } from 'next/cache';

type ProcessResult = {
  error?: string;
  extractedData?: ExtractGevascoOutput;
};

// Function to convert a file to a Base64 data URI
async function fileToDataUri(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

async function mergeAndSaveData(studentId: string, extractedData: ExtractGevascoOutput): Promise<void> {
    const student = await getStudent(studentId);
    if (!student) {
        throw new Error('Student not found');
    }

    const updatedStudentData: Partial<Student> = {};

    // Merge administrative data
    if (extractedData.administrativeData) {
        const { birthDate, level, mdphNotificationTitle, mdphNotificationExpiration, familyContacts } = extractedData.administrativeData;
        if (birthDate) updatedStudentData.birthDate = birthDate;
        if (level) updatedStudentData.level = level;
        if (mdphNotificationTitle) updatedStudentData.mdphNotificationTitle = mdphNotificationTitle;
        if (mdphNotificationExpiration) updatedStudentData.mdphNotificationExpiration = mdphNotificationExpiration;
        
        if (familyContacts && familyContacts.length > 0) {
            const existingContacts = student.familyContacts || [];
            const newContacts = familyContacts.filter(
                newContact => newContact.name && !existingContacts.some(existing => existing.name.toLowerCase() === newContact.name.toLowerCase())
            );
            updatedStudentData.familyContacts = [...existingContacts, ...newContacts];
        }
    }
    
    // Generic function to merge categorized list data
    const mergeCategory = (category: 'strengths' | 'difficulties' | 'needs' | 'globalProfile') => {
        const extractedCategoryData = extractedData[category];
        if (!extractedCategoryData) return;

        // @ts-ignore
        const existingData = student[category] || {};
        const mergedData: typeof existingData = { ...existingData };
        
        Object.keys(extractedCategoryData).forEach(key => {
            const subKey = key as keyof typeof extractedCategoryData;
            // @ts-ignore
            const existingItems = existingData[subKey] || [];
            // @ts-ignore
            const newItems = (extractedCategoryData[subKey] || []).filter(item => item && item.trim() !== '');
            
            if (Array.isArray(existingItems) && Array.isArray(newItems) && newItems.length > 0) {
                // @ts-ignore
                mergedData[subKey] = Array.from(new Set([...existingItems, ...newItems]));
            }
        });
        // @ts-ignore
        updatedStudentData[category] = mergedData;
    };

    mergeCategory('strengths');
    mergeCategory('difficulties');
    mergeCategory('needs');
    mergeCategory('globalProfile');
    
    await updateStudent(student.id, updatedStudentData);
}

export async function processGevascoFile(studentId: string, formData: FormData): Promise<ProcessResult> {
  const file = formData.get('gevascoFile') as File;

  if (!file) {
    return { error: 'Aucun fichier fourni.' };
  }

  try {
    const dataUri = await fileToDataUri(file);
    const extractedData = await extractGevascoData({ document: dataUri });

    if (!extractedData) {
        return { error: "L'extraction n'a produit aucune donnée." };
    }
    
    // Merge the extracted data with the student's current data
    await mergeAndSaveData(studentId, extractedData);
    
    // Revalidate the path to show updated data on the page
    revalidatePath(`/ppi/${studentId}`);

    // Return the extracted data to be shown in the confirmation dialog
    return { extractedData };

  } catch (error) {
    console.error('Gevasco processing error:', error);
    if (error instanceof Error) {
        return { error: `Échec du traitement du GevaSco: ${error.message}` };
    }
    return { error: 'Une erreur inconnue est survenue lors du traitement du fichier.' };
  }
}
