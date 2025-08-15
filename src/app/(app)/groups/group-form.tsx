'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, PlusCircle, Trash2, User } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import type { Group } from '@/types';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { getStudents } from '@/lib/students-repository';
import type { StudentObjectiveProfile } from '@/ai/flows/group-objectives-flow';
import { addGroup, updateGroup } from '@/lib/groups-repository';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const studentObjectiveSchema = z.object({
  id: z.string(),
  name: z.string(),
  objectiveTitle: z.string(),
  deadline: z.string().optional(),
});

const groupFormSchema = z.object({
  groupTitle: z.string().min(1, 'Le titre du groupe est requis.'),
  rationale: z.string().min(1, 'La justification est requise.'),
  students: z.array(studentObjectiveSchema).min(1, 'Le groupe doit contenir au moins un élève.'),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

interface GroupFormProps {
  group?: Group;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function GroupForm({ group, onSuccess, children }: GroupFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: students, loading: loadingStudents } = useDataFetching(getStudents);

  const allActiveObjectives = useMemo<StudentObjectiveProfile[]>(() => {
    if (!students) return [];
    return students
      .filter((student) => student.ppiStatus !== 'archived')
      .flatMap((student) =>
        (student.objectives || [])
          .filter((objective) => objective.title && !objective.validationDate)
          .map((objective) => ({
            objectiveTitle: objective.title,
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            deadline: objective.deadline,
          }))
      );
  }, [students]);

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: group || {
      groupTitle: '',
      rationale: '',
      students: [],
    },
  });
  
  useEffect(() => {
    if (group) {
      form.reset(group);
    } else {
      form.reset({ groupTitle: '', rationale: '', students: [] });
    }
  }, [group, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'students',
  });

  const availableObjectives = useMemo(() => {
    const selectedStudentIds = new Set(fields.map(f => f.id));
    return allActiveObjectives.filter(obj => !selectedStudentIds.has(obj.studentId));
  }, [allActiveObjectives, fields]);

  async function onSubmit(values: GroupFormData) {
    try {
      if (group) {
        await updateGroup(group.id, values);
        toast({ title: 'Groupe modifié', description: 'Le groupe a été mis à jour avec succès.' });
      } else {
        await addGroup(values);
        toast({ title: 'Groupe créé', description: 'Le nouveau groupe a été enregistré.' });
      }
      onSuccess();
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
      });
    }
  }

  const handleStudentSelect = (value: string) => {
    const selected = allActiveObjectives.find(obj => `${obj.studentId}::${obj.objectiveTitle}` === value);
    if (selected) {
      append({
        id: selected.studentId,
        name: selected.studentName,
        objectiveTitle: selected.objectiveTitle,
        deadline: selected.deadline,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{group ? 'Modifier le groupe' : 'Créer un nouveau groupe'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour {group ? 'modifier' : 'créer'} un groupe de travail.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="groupTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du groupe</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rationale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification / Objectif commun</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Élèves</FormLabel>
              <div className="mt-2 space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 bg-secondary rounded-md">
                    <User className="h-5 w-5 text-secondary-foreground" />
                    <div className="flex-grow">
                      <p className="font-semibold">{field.name}</p>
                      <p className="text-sm text-muted-foreground italic">"{field.objectiveTitle}"</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                 {form.formState.errors.students && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.students.message}</p>
                )}
              </div>
            </div>

            <Select onValueChange={handleStudentSelect} value="">
              <SelectTrigger disabled={loadingStudents}>
                <SelectValue placeholder={loadingStudents ? "Chargement..." : "Ajouter un élève..."} />
              </SelectTrigger>
              <SelectContent>
                 <ScrollArea className="h-72">
                    {availableObjectives.map(obj => (
                        <SelectItem key={`${obj.studentId}::${obj.objectiveTitle}`} value={`${obj.studentId}::${obj.objectiveTitle}`}>
                           <div>
                             <span className="font-semibold">{obj.studentName}</span>
                             <span className="text-muted-foreground text-xs block">
                                Objectif: {obj.objectiveTitle.length > 50 ? `${obj.objectiveTitle.substring(0, 50)}...` : obj.objectiveTitle}
                             </span>
                           </div>
                        </SelectItem>
                    ))}
                 </ScrollArea>
              </SelectContent>
            </Select>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {group ? 'Enregistrer les modifications' : 'Créer le groupe'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
