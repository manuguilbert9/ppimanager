
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, Strengths } from '@/types';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2, CheckCircle } from 'lucide-react';

const formSchema = z.object({
  academicSkills: z.array(z.string()).optional(),
  cognitiveStrengths: z.array(z.string()).optional(),
  socialSkills: z.array(z.string()).optional(),
  exploitableInterests: z.array(z.string()).optional(),
});

interface StrengthsFormProps {
  student: Student;
  academicSkillsSuggestions: string[];
  cognitiveStrengthsSuggestions: string[];
  socialSkillsSuggestions: string[];
  exploitableInterestsSuggestions: string[];
}


export function StrengthsForm({ 
  student, 
  academicSkillsSuggestions, 
  cognitiveStrengthsSuggestions,
  socialSkillsSuggestions,
  exploitableInterestsSuggestions
}: StrengthsFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicSkills: student.strengths?.academicSkills || [],
      cognitiveStrengths: student.strengths?.cognitiveStrengths || [],
      socialSkills: student.strengths?.socialSkills || [],
      exploitableInterests: student.strengths?.exploitableInterests || [],
    },
  });

  const watchedValues = form.watch();
  const debouncedValues = useDebounce(watchedValues, 1500);

  const saveForm = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const strengths: Strengths = values;
      await updateStudent(student.id, { strengths });
      
      if (values.academicSkills) addLibraryItems(values.academicSkills, 'academicSkills');
      if (values.cognitiveStrengths) addLibraryItems(values.cognitiveStrengths, 'cognitiveStrengths');
      if (values.socialSkills) addLibraryItems(values.socialSkills, 'socialSkills');
      if (values.exploitableInterests) addLibraryItems(values.exploitableInterests, 'exploitableInterests');
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [student.id, toast]);

  useEffect(() => {
    if (form.formState.isDirty) {
      saveForm(debouncedValues);
    }
  }, [debouncedValues, form.formState.isDirty, saveForm]);


  const badgeClassName = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";

  return (
    <Card className="bg-emerald-50/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Points d'appuis</CardTitle>
          <CardDescription>
              Liste des capacités, acquis et atouts sur lesquels on peut s’appuyer pour les apprentissages.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving && <><Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde...</>}
          {isSaved && <><CheckCircle className="h-4 w-4 text-green-500" /> Enregistré</>}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
             <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-medium text-emerald-800">Points forts de l'élève</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="academicSkills" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Compétences acquises</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={academicSkillsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="cognitiveStrengths" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Forces cognitives et comportementales</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={cognitiveStrengthsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="socialSkills" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Habiletés sociales ou communicationnelles</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={socialSkillsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="exploitableInterests" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Intérêts spécifiques exploitables</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={exploitableInterestsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </AccordionContent>
                </AccordionItem>
             </Accordion>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
