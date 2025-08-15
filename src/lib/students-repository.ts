
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, serverTimestamp, doc, getDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Student } from '@/types';
import { revalidatePath } from 'next/cache';
import { getClasse } from './classes-repository';
import { groupBy, orderBy } from 'lodash';

async function studentFromDoc(doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Promise<Student> {
    const data = doc.data();
    const classe = data.classId ? await getClasse(data.classId) : null;
    const lastUpdateDate = data.lastUpdate?.toDate ? data.lastUpdate.toDate() : new Date();
    
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
        teacherName: classe?.teacherName ?? 'N/A',
        lastUpdate: lastUpdateDate.toLocaleDateString('fr-FR'),
        lastUpdateDate: lastUpdateDate, // Keep date object for sorting
        ppiStatus: data.ppiStatus || 'draft',
        avatarUrl: data.avatarUrl || `https://placehold.co/40x40.png?text=${data.firstName?.substring(0,1)}${data.lastName?.substring(0,1)}`,
        globalProfile: data.globalProfile || {},
        strengths: data.strengths || {},
        difficulties: data.difficulties || {},
        needs: data.needs || {},
        objectives: data.objectives || [],
    };
}

export async function getStudents(): Promise<Student[]> {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const allStudents = await Promise.all(querySnapshot.docs.map(studentFromDoc));

    // Group students by a unique key (firstName + lastName + birthDate)
    const groupedStudents = groupBy(allStudents, s => `${s.firstName}-${s.lastName}-${s.birthDate || ''}`);

    const uniqueStudents: Student[] = [];

    for (const key in groupedStudents) {
        const studentGroup = groupedStudents[key];
        if (studentGroup && studentGroup.length > 0) {
            // Find if there's an active (not archived) student in the group
            let studentToShow = studentGroup.find(s => s.ppiStatus !== 'archived');

            // If no active student, it means all are archived. In that case, show the most recent one.
            if (!studentToShow) {
                studentToShow = orderBy(studentGroup, ['lastUpdateDate'], ['desc'])[0];
            }
            
            if (studentToShow) {
                uniqueStudents.push(studentToShow);
            }
        }
    }
    
    // Sort final list alphabetically by last name
    return orderBy(uniqueStudents, ['lastName', 'firstName'], ['asc']);
}

export async function getStudent(id: string): Promise<Student | null> {
    const docRef = doc(db, 'students', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    return studentFromDoc(docSnap);
}

export async function addStudent(student: Omit<Student, 'id' | 'className' | 'teacherName' | 'lastUpdate' | 'ppiStatus' | 'avatarUrl' | 'globalProfile' | 'strengths' | 'difficulties' | 'needs' | 'objectives'>) {
    try {
        await addDoc(collection(db, 'students'), {
            ...student,
            ppiStatus: 'draft',
            lastUpdate: serverTimestamp(),
            avatarUrl: `https://placehold.co/40x40.png?text=${student.firstName.substring(0,1)}${student.lastName.substring(0,1)}`,
            globalProfile: {},
            strengths: {},
            difficulties: {},
            needs: {},
            objectives: [],
        });
        revalidatePath('/students');
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error('Failed to add student');
    }
}

export async function updateStudent(id: string, student: Partial<Omit<Student, 'id' | 'className' | 'teacherName' | 'lastUpdate' | 'avatarUrl'>>) {
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

export async function duplicatePpi(studentId: string) {
    const student = await getStudent(studentId);
    if (!student) {
        throw new Error("Student not found");
    }

    const newStudentData = { ...student };
    delete (newStudentData as Partial<Student>).id; // remove id for new doc
    
    // Reset objectives validation date
    newStudentData.objectives = (newStudentData.objectives || []).map(obj => ({
        ...obj,
        validationDate: '',
    }));
    
    // Set new PPI to draft
    newStudentData.ppiStatus = 'draft';
    newStudentData.lastUpdate = new Date().toLocaleDateString('fr-FR');

    try {
        const batch = writeBatch(db);
        
        // Archive old student record if it's not already
        const oldStudentRef = doc(db, 'students', studentId);
        batch.update(oldStudentRef, { ppiStatus: 'archived' });

        // Create new student record for the new PPI
        const newStudentRef = doc(collection(db, 'students'));
        const { id, lastUpdateDate, ...dataToSet } = newStudentData; // Ensure we don't try to set the 'id' field
        batch.set(newStudentRef, {
            ...dataToSet,
            lastUpdate: serverTimestamp(),
        });
        
        await batch.commit();

        revalidatePath('/ppi');
        revalidatePath('/students');
    } catch (error) {
        console.error("Error duplicating PPI: ", error);
        throw new Error('Failed to duplicate PPI');
    }
}
