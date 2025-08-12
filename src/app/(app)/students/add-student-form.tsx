'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Classe } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'Le prénom est requis.' }),
  lastName: z.string().min(1, { message: 'Le nom est requis.' }),
  birthDate: z.string().optional(),
  sex: z.enum(['male', 'female', 'other']).optional(),
  school: z.string().optional(),
  level: z.string().optional(),
  mdphNotification: z.string().optional(),
  admissionDate: z.string().optional(),
  reviewDate: z.string().optional(),
  referents: z.string().optional(),
  familyContacts: z.string().optional(),
  parentalAuthority: z.string().optional(),
  classId: z.string({ required_error: 'Veuillez sélectionner une classe.' }),
});

export function AddStudentForm({ classes }: { classes: Classe[] }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addStudent(values);
      toast({
        title: 'Élève ajouté',
        description: `${values.firstName} ${values.lastName} a été ajouté avec succès.`,
      });
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'ajout de l'élève",
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un élève
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel élève</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour ajouter un nouvel élève.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 p-1">
              <h3 className="text-lg font-medium">Identité de l’élève</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl><Input placeholder="Dupont" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl><Input placeholder="Jean" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="birthDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de naissance</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(new Date(field.value), "PPP") : <span>Choisir une date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus />
                      </PopoverContent>
                    </Popover>
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
              <h3 className="text-lg font-medium pt-4">Scolarisation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="school" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Établissement</FormLabel>
                    <FormControl><Input placeholder="ex: Collège Jacques Prévert" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="ex: 6ème" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
               <h3 className="text-lg font-medium pt-4">Orientation et Référents</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="mdphNotification" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Notification MDPH</FormLabel>
                          <FormControl><Textarea placeholder="Type de placement, durée, etc." {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="referents" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Référents éducatifs</FormLabel>
                          <FormControl><Textarea placeholder="Noms de l'enseignant, éducateur, etc." {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
               </div>
                <h3 className="text-lg font-medium pt-4">Famille</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="familyContacts" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contacts familiaux</FormLabel>
                            <FormControl><Textarea placeholder="Responsables légaux, coordonnées..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="parentalAuthority" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Autorité parentale</FormLabel>
                            <FormControl><Textarea placeholder="Qui détient l'autorité, situation familiale..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
