'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Classe } from '@/types';
import { revalidatePath } from 'next/cache';

function classeFromDoc(doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Classe {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
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

export async function addClasse(classe: { name: string; }) {
    try {
        await addDoc(collection(db, 'classes'), classe);
        revalidatePath('/classes');
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error('Failed to add classe');
    }
}

export async function updateClasse(id: string, classe: { name: string; }) {
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
        await deleteDoc(doc(db, "classes", id));
        revalidatePath('/classes');
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw new Error('Failed to delete classe');
    }
}
