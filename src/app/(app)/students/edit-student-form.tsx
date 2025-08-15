
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { updateStudent } from '@/lib/students-repository';
import type { Student, Classe } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';

const familyContactSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Intitulé requis'),
  name: z.string().min(1, 'Nom requis'),
  street: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
});


const formSchema = z.object({
  firstName: z.string().min(1, { message: 'Le prénom est requis.' }),
  lastName: z.string().min(1, { message: 'Le nom est requis.' }),
  birthDate: z.string().optional(),
  sex: z.enum(['male', 'female', 'other']).optional(),
  school: z.string().optional(),
  level: z.string().optional(),
  mdphNotificationTitle: z.string().optional(),
  mdphNotificationExpiration: z.string().optional(),
  familyContacts: z.array(familyContactSchema),
  classId: z.string({ required_error: 'Veuillez sélectionner une classe.' }),
});

export function EditStudentForm({ student, classes }: { student: Student, classes: Classe[] }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
      sex: student.sex,
      school: student.school,
      level: student.level,
      mdphNotificationTitle: student.mdphNotificationTitle,
      mdphNotificationExpiration: student.mdphNotificationExpiration,
      familyContacts: student.familyContacts || [],
      classId: student.classId,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "familyContacts"
  });

  const watchedClassId = useWatch({
    control: form.control,
    name: 'classId',
  });

  const selectedClass = classes.find(c => c.id === watchedClassId);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateStudent(student.id, values);
      toast({
        title: 'Élève modifié',
        description: `${values.firstName} ${values.lastName} a été mis à jour avec succès.`,
      });
      form.reset(values);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erreur lors de la modification de l'élève",
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Modifier l'élève
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'élève</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de l'élève ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-6 p-1">
              <h3 className="text-lg font-medium border-b pb-2">Identité de l’élève</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="birthDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl><Input type="text" placeholder="JJ/MM/AAAA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sex" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner le sexe" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="male">Masculin</SelectItem>
                        <SelectItem value="female">Féminin</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <h3 className="text-lg font-medium border-b pb-2 pt-4">Scolarisation</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="school" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Établissement</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="classId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger></FormControl>
                      <SelectContent>{classes.map((classe) => (<SelectItem key={classe.id} value={classe.id}>{classe.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau scolaire de référence</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
               <h3 className="text-lg font-medium border-b pb-2 pt-4">Orientation et Référents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel>Enseignant</FormLabel>
                        <Input readOnly value={selectedClass?.teacherName || 'Aucun enseignant défini pour cette classe'} className="mt-2 bg-gray-100" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <FormField control={form.control} name="mdphNotificationTitle" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Intitulé Notification MDPH</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="mdphNotificationExpiration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date d'expiration MDPH</FormLabel>
                            <FormControl><Input type="text" placeholder="JJ/MM/AAAA" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <h3 className="text-lg font-medium border-b pb-2 pt-4">Famille</h3>
                <div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md mb-4 relative">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`familyContacts.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Intitulé</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name={`familyContacts.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                      </div>
                      <div className="mt-4">
                          <FormLabel>Adresse</FormLabel>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-2">
                            <FormField control={form.control} name={`familyContacts.${index}.street`} render={({ field }) => (
                              <FormItem><FormControl><Input placeholder="Rue" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`familyContacts.${index}.postalCode`} render={({ field }) => (
                               <FormItem><FormControl><Input placeholder="Code Postal" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`familyContacts.${index}.city`} render={({ field }) => (
                               <FormItem><FormControl><Input placeholder="Ville" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField control={form.control} name={`familyContacts.${index}.phone`} render={({ field }) => (
                            <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name={`familyContacts.${index}.email`} render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', name: '', street: '', postalCode: '', city: '', phone: '', email: ''})}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter un contact familial
                  </Button>
                </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Modification en cours...'
                  : 'Enregistrer les modifications'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
