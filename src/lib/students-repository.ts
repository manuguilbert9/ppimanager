'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import type { Student } from '@/types';

function studentFromDoc(doc: QueryDocumentSnapshot<DocumentData>): Student {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        class: data.class,
        lastUpdate: data.lastUpdate,
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
