
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Ppi, Student, PpiStatus } from '@/types';
import { getStudents } from './students-repository';
import { revalidatePath } from 'next/cache';

function ppiFromStudent(student: Student): Ppi {
    return {
        id: student.id, // Using student id as ppi id
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        lastUpdate: student.lastUpdate,
        status: student.ppiStatus || 'draft',
    };
}

export async function getPpis(): Promise<Ppi[]> {
    const students = await getStudents();
    return students.map(ppiFromStudent);
}

export async function getPpi(id: string): Promise<Ppi | null> {
    const students = await getStudents();
    const student = students.find(s => s.id === id);
    if (!student) {
        // Fallback to trying to read from a ppi doc for compatibility
        const docRef = doc(db, 'ppis', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return null;
        }
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
        await updateDoc(studentRef, {
            ppiStatus: status,
        });
        revalidatePath('/ppi');
    } catch (error) {
        console.error("Error updating PPI status: ", error);
        throw new Error('Failed to update PPI status');
    }
}
