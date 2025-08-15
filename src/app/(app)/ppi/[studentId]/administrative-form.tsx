
'use client';

import { useForm, useFieldArray, useWatch, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Classe } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

export const administrativeSchema = z.object({
  firstName: z.string().min(1, { message: 'Le prénom est requis.' }),
  lastName: z.string().min(1, { message: 'Le nom est requis.' }),
  birthDate: z.string().optional(),
  sex: z.enum(['male', 'female', 'other']).optional(),
  school: z.string().optional(),
  level: z.string().optional(),
  mdphNotificationTitle: z.string().optional(),
  mdphNotificationExpiration: z.string().optional(),
  familyContacts: z.array(familyContactSchema).optional(),
  classId: z.string({ required_error: 'Veuillez sélectionner une classe.' }),
});

export function AdministrativeForm({ classes }: { classes: Classe[] }) {
  const form = useFormContext<z.infer<typeof administrativeSchema>>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "familyContacts"
  });

  const watchedClassId = useWatch({
    control: form.control,
    name: 'classId',
  });

  const selectedClass = classes.find(c => c.id === watchedClassId);

  return (
    <Card className="bg-blue-50/50">
      <CardHeader>
        <div>
          <CardTitle>Informations administratives</CardTitle>
          <CardDescription>
            Données d'identification, de scolarisation et contacts familiaux de l'élève.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            <Accordion type="multiple" className="w-full" defaultValue={['identity', 'schooling', 'family']}>
              <AccordionItem value="identity">
                <AccordionTrigger className="text-lg font-medium text-blue-800">Identité de l’élève</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schooling">
                <AccordionTrigger className="text-lg font-medium text-blue-800">Scolarisation et Orientation</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                    <div>
                        <FormLabel>Enseignant</FormLabel>
                        <Input readOnly value={selectedClass?.teacherName || 'Aucun enseignant défini'} className="mt-2 bg-gray-100" />
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
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="family">
                <AccordionTrigger className="text-lg font-medium text-blue-800">Famille / Représentants légaux</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md relative bg-background/50">
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
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', name: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un contact
                    </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
