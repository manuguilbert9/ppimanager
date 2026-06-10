
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, query, where, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import type { LibraryItem } from '@/types';
import { revalidatePath } from 'next/cache';

function libraryItemFromDoc(docData: QueryDocumentSnapshot<DocumentData> | DocumentData): LibraryItem {
    const data = docData.data();
    return {
        id: docData.id,
        text: data.text,
        category: data.category,
    };
}

export async function getAllLibraryItems(userId: string): Promise<LibraryItem[]> {
    const q = query(collection(db, 'library'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(libraryItemFromDoc);
}

export async function getLibraryItems(category: LibraryItem['category'], userId?: string): Promise<LibraryItem[]> {
    if (!userId) return [];
    const q = query(
        collection(db, 'library'),
        where('category', '==', category),
        where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(libraryItemFromDoc);
}

export async function addLibraryItems(items: string[], category: LibraryItem['category'], userId: string) {
    if (!items || items.length === 0 || !userId) return;

    try {
        const libraryRef = collection(db, 'library');
        const itemsInDBQuery = query(
            libraryRef,
            where('category', '==', category),
            where('userId', '==', userId),
            where('text', 'in', items.slice(0, 30))
        );

        const existingDocs = await getDocs(itemsInDBQuery);
        const existingItems = existingDocs.docs.map(d => d.data().text as string);
        const newItems = items.filter(item => !existingItems.includes(item));

        if (newItems.length > 0) {
            const batch = writeBatch(db);
            newItems.forEach(itemText => {
                const docRef = doc(collection(db, 'library'));
                batch.set(docRef, { text: itemText, category, userId });
            });
            await batch.commit();
            revalidatePath('/library');
            revalidatePath('/ppi/*');
        }
    } catch (error) {
        console.error("Error adding library items: ", error);
        // Ne pas propager l'erreur pour ne pas interrompre le flux utilisateur.
    }
}

export async function getLibraryItemsCount(userId?: string): Promise<number> {
    if (!userId) return 0;
    const q = query(collection(db, 'library'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}
