
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, serverTimestamp, doc, deleteDoc, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Group } from '@/types';
import { revalidatePath } from 'next/cache';

function groupFromDoc(docData: QueryDocumentSnapshot<DocumentData> | DocumentData): Group {
    const data = docData.data();
    const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

    return {
        id: docData.id,
        groupTitle: data.groupTitle,
        rationale: data.rationale,
        students: data.students,
        createdAt: createdAtDate.toLocaleDateString('fr-FR'),
    };
}

export async function getGroups(userId: string): Promise<Group[]> {
    const q = query(
        collection(db, 'groups'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(groupFromDoc);
}

export async function addGroup(group: Omit<Group, 'id' | 'createdAt'>, userId: string) {
    try {
        await addDoc(collection(db, 'groups'), {
            ...group,
            userId,
            createdAt: serverTimestamp(),
        });
        revalidatePath('/groups');
    } catch (error) {
        console.error("Error adding group: ", error);
        throw new Error('Failed to add group');
    }
}

export async function updateGroup(id: string, group: Omit<Group, 'id' | 'createdAt'>) {
    try {
        const groupRef = doc(db, 'groups', id);
        await updateDoc(groupRef, group);
        revalidatePath('/groups');
    } catch (error) {
        console.error("Error updating group: ", error);
        throw new Error('Failed to update group');
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
