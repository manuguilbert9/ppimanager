'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, serverTimestamp, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Student } from '@/types';
import { revalidatePath } from 'next/cache';

function studentFromDoc(doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Student {
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
    const docRef = doc(db, 'students', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    return studentFromDoc(docSnap);
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

export async function updateStudent(id: string, student: { name: string; class: string; }) {
    try {
        const studentRef = doc(db, 'students', id);
        await updateDoc(studentRef, {
            ...student,
            lastUpdate: serverTimestamp()
        });
        revalidatePath('/students');
    } catch (error) {
        console.error("Error updating document: ", error);
        throw new Error('Failed to update student');
    }
}

export async function deleteStudent(id: string) {
    try {
        await deleteDoc(doc(db, "students", id));
        revalidatePath('/students');
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw new Error('Failed to delete student');
    }
}
