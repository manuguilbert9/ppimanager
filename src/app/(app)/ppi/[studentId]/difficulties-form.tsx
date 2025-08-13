
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, Difficulties } from '@/types';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2, CheckCircle } from 'lucide-react';

const formSchema = z.object({
  cognitiveDifficulties: z.array(z.string()).optional(),
  schoolDifficulties: z.array(z.string()).optional(),
  motorDifficulties: z.array(z.string()).optional(),
  socioEmotionalDifficulties: z.array(z.string()).optional(),
  disabilityConstraints: z.array(z.string()).optional(),
});

interface DifficultiesFormProps {
  student: Student;
  cognitiveDifficultiesSuggestions: string[];
  schoolDifficultiesSuggestions: string[];
  motorDifficultiesSuggestions: string[];
  socioEmotionalDifficultiesSuggestions: string[];
  disabilityConstraintsSuggestions: string[];
}


export function DifficultiesForm({ 
  student, 
  cognitiveDifficultiesSuggestions,
  schoolDifficultiesSuggestions,
  motorDifficultiesSuggestions,
  socioEmotionalDifficultiesSuggestions,
  disabilityConstraintsSuggestions,
}: DifficultiesFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cognitiveDifficulties: student.difficulties?.cognitiveDifficulties || [],
      schoolDifficulties: student.difficulties?.schoolDifficulties || [],
      motorDifficulties: student.difficulties?.motorDifficulties || [],
      socioEmotionalDifficulties: student.difficulties?.socioEmotionalDifficulties || [],
      disabilityConstraints: student.difficulties?.disabilityConstraints || [],
    },
  });

  const watchedValues = form.watch();
  const debouncedValues = useDebounce(watchedValues, 1500);

  const saveForm = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const difficulties: Difficulties = values;
      await updateStudent(student.id, { difficulties });
      
      if (values.cognitiveDifficulties) addLibraryItems(values.cognitiveDifficulties, 'cognitiveDifficulties');
      if (values.schoolDifficulties) addLibraryItems(values.schoolDifficulties, 'schoolDifficulties');
      if (values.motorDifficulties) addLibraryItems(values.motorDifficulties, 'motorDifficulties');
      if (values.socioEmotionalDifficulties) addLibraryItems(values.socioEmotionalDifficulties, 'socioEmotionalDifficulties');
      if (values.disabilityConstraints) addLibraryItems(values.disabilityConstraints, 'disabilityConstraints');
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      form.reset(values);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [student.id, toast, form]);


  useEffect(() => {
    if (form.formState.isDirty) {
        saveForm(debouncedValues);
    }
  }, [debouncedValues, form.formState.isDirty, saveForm]);


  const badgeClassName = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  return (
    <Card className="bg-red-50/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Difficultés de l’élève</CardTitle>
          <CardDescription>
              Identification des obstacles et limitations qui impactent ses apprentissages.
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
                    <AccordionTrigger className="text-lg font-medium text-red-800">Points de vigilance</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="cognitiveDifficulties" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficultés cognitives</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={cognitiveDifficultiesSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="schoolDifficulties" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficultés scolaires</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={schoolDifficultiesSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="motorDifficulties" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficultés motrices et fonctionnelles</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={motorDifficultiesSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="socioEmotionalDifficulties" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficultés socio-émotionnelles ou comportementales</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={socioEmotionalDifficultiesSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="disabilityConstraints" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraintes liées au handicap</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={disabilityConstraintsSuggestions} badgeClassName={badgeClassName} /></FormControl>
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
