
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { LibraryItem } from '@/types';

function libraryItemFromDoc(doc: QueryDocumentSnapshot<DocumentData>): LibraryItem {
    const data = doc.data();
    return {
        id: doc.id,
        text: data.text,
        category: data.category,
    };
}

export async function getLibraryItems(category: LibraryItem['category']): Promise<LibraryItem[]> {
    const q = query(collection(db, 'library'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(libraryItemFromDoc);
}

export async function getLibraryItemsCount(): Promise<number> {
    const querySnapshot = await getDocs(collection(db, 'library'));
    return querySnapshot.size;
}
