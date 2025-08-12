'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import type { Ppi } from '@/types';

function ppiFromDoc(doc: QueryDocumentSnapshot<DocumentData>): Ppi {
    const data = doc.data();
    return {
        id: doc.id,
        studentName: data.studentName,
        lastUpdate: data.lastUpdate,
        status: data.status,
    };
}

export async function getPpis(): Promise<Ppi[]> {
    const querySnapshot = await getDocs(collection(db, 'ppis'));
    return querySnapshot.docs.map(ppiFromDoc);
}

export async function getPpi(id: string): Promise<Ppi | null> {
    const querySnapshot = await getDocs(collection(db, 'ppis'));
    const doc = querySnapshot.docs.find(d => d.id === id);
    if (!doc) {
        return null;
    }
    return ppiFromDoc(doc);
}
