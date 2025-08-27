
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, doc, getDoc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Classe } from '@/types';
import { revalidatePath } from 'next/cache';

function classeFromDoc(doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Classe {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        teacherName: data.teacherName,
    };
}

export async function getClasses(): Promise<Classe[]> {
    const querySnapshot = await getDocs(collection(db, 'classes'));
    return querySnapshot.docs.map(classeFromDoc);
}

export async function getClasse(id: string): Promise<Classe | null> {
    const docRef = doc(db, 'classes', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    return classeFromDoc(docSnap);
}

export async function addClasse(classe: { name: string; teacherName: string; }): Promise<Classe> {
    try {
        const docRef = await addDoc(collection(db, 'classes'), classe);
        revalidatePath('/classes');
        return {
            id: docRef.id,
            ...classe,
        };
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error('Failed to add classe');
    }
}

export async function updateClasse(id: string, classe: { name: string; teacherName: string; }) {
    try {
        const classeRef = doc(db, 'classes', id);
        await updateDoc(classeRef, classe);
        revalidatePath('/classes');
    } catch (error) {
        console.error("Error updating document: ", error);
        throw new Error('Failed to update classe');
    }
}

export async function deleteClasse(id: string) {
    try {
        const batch = writeBatch(db);

        // 1. Find all students in the class
        const studentsQuery = query(collection(db, 'students'), where('classId', '==', id));
        const studentsSnapshot = await getDocs(studentsQuery);

        // 2. Delete each student found
        studentsSnapshot.forEach(studentDoc => {
            batch.delete(studentDoc.ref);
        });

        // 3. Delete the class itself
        const classRef = doc(db, "classes", id);
        batch.delete(classRef);

        // 4. Commit the batch
        await batch.commit();

        revalidatePath('/classes');
        revalidatePath('/students');
        revalidatePath('/ppi');
    } catch (error) {
        console.error("Error deleting class and its students: ", error);
        throw new Error('Failed to delete classe');
    }
}
