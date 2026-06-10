
'use server';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Ppi, Student, PpiStatus } from '@/types';
import { getAllStudentDocs, getStudent } from './students-repository';
import { revalidatePath } from 'next/cache';

function ppiFromStudent(student: Student): Ppi {
    return {
        id: student.id,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        lastUpdate: student.lastUpdate,
        status: student.ppiStatus || 'draft',
    };
}

export async function getPpis(userId: string): Promise<Ppi[]> {
    const students = await getAllStudentDocs(userId);
    return students.map(ppiFromStudent);
}

export async function getPpi(id: string): Promise<Ppi | null> {
    const student = await getStudent(id);
    if (!student) {
        // Fallback sur la collection legacy ppis pour la compatibilité.
        const docRef = doc(db, 'ppis', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        const data = docSnap.data();
        return {
            id: docSnap.id,
            studentId: data.studentId,
            studentName: data.studentName,
            lastUpdate: data.lastUpdate,
            status: data.status,
        };
    }
    return ppiFromStudent(student);
}

export async function updatePpiStatus(studentId: string, status: PpiStatus) {
    try {
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, { ppiStatus: status });
        revalidatePath('/ppi');
    } catch (error) {
        console.error("Error updating PPI status: ", error);
        throw new Error('Failed to update PPI status');
    }
}
