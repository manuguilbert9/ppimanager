
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, query, where, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import type { LibraryItem } from '@/types';
import { revalidatePath } from 'next/cache';

function libraryItemFromDoc(doc: QueryDocumentSnapshot<DocumentData> | DocumentData): LibraryItem {
    const data = doc.data();
    return {
        id: doc.id,
        text: data.text,
        category: data.category,
    };
}

export async function getAllLibraryItems(): Promise<LibraryItem[]> {
    const querySnapshot = await getDocs(collection(db, 'library'));
    return querySnapshot.docs.map(libraryItemFromDoc);
}

export async function getLibraryItems(category: LibraryItem['category']): Promise<LibraryItem[]> {
    const q = query(collection(db, 'library'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(libraryItemFromDoc);
}

export async function addLibraryItems(items: string[], category: LibraryItem['category']) {
    if (!items || items.length === 0) {
        return;
    }
    
    try {
        const libraryRef = collection(db, 'library');
        const itemsInDBQuery = query(libraryRef, where('category', '==', category), where('text', 'in', items.slice(0, 30)));
        
        const existingDocs = await getDocs(itemsInDBQuery);
        const existingItems = existingDocs.docs.map(doc => doc.data().text as string);

        const newItems = items.filter(item => !existingItems.includes(item));

        if (newItems.length > 0) {
            const batch = writeBatch(db);
            newItems.forEach(itemText => {
                const docRef = doc(collection(db, 'library')); 
                batch.set(docRef, { text: itemText, category: category });
            });
            await batch.commit();
            revalidatePath('/library');
            revalidatePath('/ppi/*');
        }
    } catch (error) {
        console.error("Error adding library items: ", error);
        // Do not throw error to not interrupt user flow
    }
}


export async function getLibraryItemsCount(): Promise<number> {
    const querySnapshot = await getDocs(collection(db, 'library'));
    return querySnapshot.size;
}
