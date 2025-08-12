'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Ppi } from '@/types';

function ppiFromDoc(doc: QueryDocumentSnapshot<DocumentData>): Ppi {
    const data = doc.data();
    return {
        id: doc.id,
        studentId: data.studentId,
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
    const docRef = doc(db, 'ppis', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
    return ppiFromDoc(docSnap);
}
