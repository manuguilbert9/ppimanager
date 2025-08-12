'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Student } from '@/types';
import { revalidatePath } from 'next/cache';

function studentFromDoc(doc: QueryDocumentSnapshot<DocumentData>): Student {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        class: data.class,
        lastUpdate: data.lastUpdate?.toDate ? data.lastUpdate.toDate().toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
        status: data.status,
        avatarUrl: data.avatarUrl || 'https://placehold.co/40x40.png'
    };
}

export async function getStudents(): Promise<Student[]> {
    const querySnapshot = await getDocs(collection(db, 'students'));
    return querySnapshot.docs.map(studentFromDoc);
}

export async function getStudent(id: string): Promise<Student | null> {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const doc = querySnapshot.docs.find(d => d.id === id);
    if (!doc) {
        return null;
    }
    return studentFromDoc(doc);
}

export async function addStudent(student: { name: string; class: string; }) {
    try {
        await addDoc(collection(db, 'students'), {
            ...student,
            status: 'active',
            lastUpdate: serverTimestamp(),
            avatarUrl: `https://placehold.co/40x40.png?text=${student.name.substring(0,2)}`
        });
        revalidatePath('/students');
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error('Failed to add student');
    }
}
