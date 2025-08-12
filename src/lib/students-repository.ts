'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, serverTimestamp, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Student } from '@/types';
import { revalidatePath } from 'next/cache';
import { getClasse } from './classes-repository';

async function studentFromDoc(doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Promise<Student> {
    const data = doc.data();
    const classe = data.classId ? await getClasse(data.classId) : null;
    return {
        id: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        sex: data.sex,
        school: data.school,
        level: data.level,
        mdphNotificationTitle: data.mdphNotificationTitle,
        mdphNotificationExpiration: data.mdphNotificationExpiration,
        familyContacts: data.familyContacts || [],
        classId: data.classId,
        className: classe?.name ?? 'N/A',
        lastUpdate: data.lastUpdate?.toDate ? data.lastUpdate.toDate().toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
        status: data.status,
        avatarUrl: data.avatarUrl || `https://placehold.co/40x40.png?text=${data.firstName?.substring(0,1)}${data.lastName?.substring(0,1)}`,
        globalProfile: data.globalProfile || {},
        strengths: data.strengths || {},
        difficulties: data.difficulties || {},
        needs: data.needs || {},
    };
}

export async function getStudents(): Promise<Student[]> {
    const querySnapshot = await getDocs(collection(db, 'students'));
    return Promise.all(querySnapshot.docs.map(studentFromDoc));
}

export async function getStudent(id: string): Promise<Student | null> {
    const docRef = doc(db, 'students', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    return studentFromDoc(docSnap);
}

export async function addStudent(student: Omit<Student, 'id' | 'className' | 'lastUpdate' | 'status' | 'avatarUrl' | 'globalProfile' | 'strengths' | 'difficulties' | 'needs'>) {
    try {
        await addDoc(collection(db, 'students'), {
            ...student,
            status: 'active',
            lastUpdate: serverTimestamp(),
            avatarUrl: `https://placehold.co/40x40.png?text=${student.firstName.substring(0,1)}${student.lastName.substring(0,1)}`,
            globalProfile: {},
            strengths: {},
            difficulties: {},
            needs: {},
        });
        revalidatePath('/students');
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error('Failed to add student');
    }
}

export async function updateStudent(id: string, student: Partial<Omit<Student, 'id' | 'className' | 'lastUpdate' | 'status' | 'avatarUrl'>>) {
    try {
        const studentRef = doc(db, 'students', id);
        await updateDoc(studentRef, {
            ...student,
            lastUpdate: serverTimestamp()
        });
        revalidatePath('/students');
        revalidatePath(`/ppi/${id}`);
    } catch (error) {
        console.error("Error updating document: ", error);
        throw new Error('Failed to update student');
    }
}

export async function deleteStudent(id: string) {
    try {
        await deleteDoc(doc(db, "students", id));
        revalidatePath('/students');
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw new Error('Failed to delete student');
    }
}
