
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, doc, getDoc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Classe } from '@/types';
import { revalidatePath } from 'next/cache';

function classeFromDoc(docData: QueryDocumentSnapshot<DocumentData> | DocumentData): Classe {
    const data = docData.data();
    return {
        id: docData.id,
        name: data.name,
        teacherName: data.teacherName,
    };
}

export async function getClasses(userId: string): Promise<Classe[]> {
    const q = query(collection(db, 'classes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(classeFromDoc);
}

/** Récupère une classe par son ID (sans filtre userId — utilisé comme référence interne). */
export async function getClasse(id: string): Promise<Classe | null> {
    const docRef = doc(db, 'classes', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return classeFromDoc(docSnap);
}

export async function addClasse(classe: { name: string; teacherName: string; }, userId: string): Promise<Classe> {
    try {
        const docRef = await addDoc(collection(db, 'classes'), { ...classe, userId });
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

export async function deleteClasse(id: string, userId: string) {
    try {
        const batch = writeBatch(db);

        // Supprime uniquement les élèves de cet utilisateur dans cette classe.
        const studentsQuery = query(
            collection(db, 'students'),
            where('classId', '==', id),
            where('userId', '==', userId)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        studentsSnapshot.forEach(studentDoc => {
            batch.delete(studentDoc.ref);
        });

        const classRef = doc(db, "classes", id);
        batch.delete(classRef);

        await batch.commit();
        revalidatePath('/classes');
        revalidatePath('/students');
        revalidatePath('/ppi');
    } catch (error) {
        console.error("Error deleting class and its students: ", error);
        throw new Error('Failed to delete classe');
    }
}
