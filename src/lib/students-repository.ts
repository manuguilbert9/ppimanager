
'use server';

import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, serverTimestamp, doc, getDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Student, ImportedStudent, Classe } from '@/types';
import { revalidatePath } from 'next/cache';
import { getClasse, addClasse, getClasses } from './classes-repository';
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
        lastUpdateTimestamp: lastUpdateDate.getTime(), // Use serializable timestamp
        ppiStatus: data.ppiStatus || 'draft',
        avatarUrl: data.avatarUrl || `https://placehold.co/40x40.png?text=${data.firstName?.substring(0,1)}${data.lastName?.substring(0,1)}`,
        globalProfile: data.globalProfile || {},
        strengths: data.strengths || {},
        difficulties: data.difficulties || {},
        needs: data.needs || {},
        objectives: data.objectives || [],
        notes: data.notes || '',
    };
}

/**
 * Fetches all student documents from Firestore without any filtering or grouping.
 * This is useful for contexts like the PPI page where all versions (including archived) are needed.
 * @returns A promise that resolves to an array of all Student objects.
 */
export async function getAllStudentDocs(): Promise<Student[]> {
    const querySnapshot = await getDocs(collection(db, 'students'));
    return await Promise.all(querySnapshot.docs.map(studentFromDoc));
}


export async function getStudents(): Promise<Student[]> {
    const allStudents = await getAllStudentDocs();

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
                studentToShow = orderBy(studentGroup, ['lastUpdateTimestamp'], ['desc'])[0];
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

export async function addStudent(student: Omit<Student, 'id' | 'className' | 'teacherName' | 'lastUpdate' | 'ppiStatus' | 'avatarUrl' | 'globalProfile' | 'strengths' | 'difficulties' | 'needs' | 'objectives' | 'lastUpdateTimestamp' | 'notes'>) {
    try {
        await addDoc(collection(db, 'students'), {
            ...student,
            ppiStatus: student.ppiStatus || 'to_create',
            lastUpdate: serverTimestamp(),
            avatarUrl: `https://placehold.co/40x40.png?text=${student.firstName.substring(0,1)}${student.lastName.substring(0,1)}`,
            globalProfile: {},
            strengths: {},
            difficulties: {},
            needs: {},
            objectives: [],
            notes: '',
        });
        revalidatePath('/students');
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error('Failed to add student');
    }
}

export async function updateStudent(id: string, student: Partial<Student>) {
    try {
        const studentRef = doc(db, 'students', id);
        // We remove properties that should not be written to Firestore
        const { className, teacherName, lastUpdateTimestamp, ...dataToUpdate } = student;
        
        await updateDoc(studentRef, {
            ...dataToUpdate,
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
        const { id, lastUpdateTimestamp, ...dataToSet } = newStudentData; // Ensure we don't try to set the 'id' field
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

const normalizeClassName = (name: string) => {
    return name.toLowerCase().replace(/ue\s/g, '').trim();
}

export async function importStudents(students: ImportedStudent[]): Promise<{ added: number, skipped: number }> {
    const existingStudents = await getStudents();
    const existingClasses = await getClasses();

    const existingStudentKeys = new Set(existingStudents.map(s => `${s.firstName.toLowerCase()}-${s.lastName.toLowerCase()}-${s.birthDate || ''}`));
    const classMap = new Map<string, Classe>();
    existingClasses.forEach(c => classMap.set(normalizeClassName(c.name), c));

    let added = 0;
    let skipped = 0;
    
    const batch = writeBatch(db);

    for (const student of students) {
        const studentKey = `${student.firstName.toLowerCase()}-${student.lastName.toLowerCase()}-${student.birthDate || ''}`;
        if (existingStudentKeys.has(studentKey)) {
            skipped++;
            continue;
        }

        let studentClass: Classe | undefined;
        const normalizedClassName = normalizeClassName(student.className);

        if (classMap.has(normalizedClassName)) {
            studentClass = classMap.get(normalizedClassName);
        } else {
            // Create new class if it doesn't exist
            try {
                const newClass = await addClasse({ name: student.className, teacherName: 'N/A' });
                classMap.set(normalizedClassName, newClass);
                studentClass = newClass;
            } catch (error) {
                console.error(`Failed to create class ${student.className}`, error);
                continue; // Skip student if class creation fails
            }
        }
        
        if (!studentClass) {
            skipped++;
            continue;
        }

        const newStudentDocRef = doc(collection(db, 'students'));
        batch.set(newStudentDocRef, {
            firstName: student.firstName,
            lastName: student.lastName,
            birthDate: student.birthDate || '',
            classId: studentClass.id,
            ppiStatus: 'to_create',
            lastUpdate: serverTimestamp(),
            familyContacts: [],
            avatarUrl: `https://placehold.co/40x40.png?text=${student.firstName.substring(0,1)}${student.lastName.substring(0,1)}`,
        });

        added++;
        existingStudentKeys.add(studentKey); // Add to set to prevent duplicate additions from the same import file
    }

    await batch.commit();

    if (added > 0) {
        revalidatePath('/students');
    }

    return { added, skipped };
}
