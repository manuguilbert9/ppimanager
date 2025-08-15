
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, serverTimestamp, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import type { Group } from '@/types';
import type { StudentObjectiveGroup } from '@/ai/flows/group-objectives-flow';
import { revalidatePath } from 'next/cache';

function groupFromDoc(doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Group {
    const data = doc.data();
    const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
    
    return {
        id: doc.id,
        groupTitle: data.groupTitle,
        rationale: data.rationale,
        students: data.students,
        createdAt: createdAtDate.toLocaleDateString('fr-FR'),
    };
}

export async function getGroups(): Promise<Group[]> {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(groupFromDoc);
}

export async function addGroup(group: StudentObjectiveGroup) {
    try {
        await addDoc(collection(db, 'groups'), {
            ...group,
            createdAt: serverTimestamp(),
        });
        revalidatePath('/groups');
    } catch (error) {
        console.error("Error adding group: ", error);
        throw new Error('Failed to add group');
    }
}

export async function deleteGroup(id: string) {
    try {
        await deleteDoc(doc(db, "groups", id));
        revalidatePath('/groups');
    } catch (error) {
        console.error("Error deleting group: ", error);
        throw new Error('Failed to delete group');
    }
}
