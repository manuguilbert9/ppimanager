'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, Difficulties } from '@/types';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const difficulties: Difficulties = values;
      await updateStudent(student.id, { difficulties });
      
      // Add new tags to the library
      if (values.cognitiveDifficulties) addLibraryItems(values.cognitiveDifficulties, 'cognitiveDifficulties');
      if (values.schoolDifficulties) addLibraryItems(values.schoolDifficulties, 'schoolDifficulties');
      if (values.motorDifficulties) addLibraryItems(values.motorDifficulties, 'motorDifficulties');
      if (values.socioEmotionalDifficulties) addLibraryItems(values.socioEmotionalDifficulties, 'socioEmotionalDifficulties');
      if (values.disabilityConstraints) addLibraryItems(values.disabilityConstraints, 'disabilityConstraints');
      
      toast({
        title: 'Difficultés mises à jour',
        description: `Les difficultés de ${student.firstName} ${student.lastName} ont été enregistrées.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Difficultés de l’élève</CardTitle>
        <CardDescription>
            Identification des obstacles et limitations qui impactent ses apprentissages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-medium">Points de vigilance</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="cognitiveDifficulties" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficultés cognitives</FormLabel>
                                <FormControl><ComboboxInput placeholder="Troubles de l'attention..." {...field} suggestions={cognitiveDifficultiesSuggestions} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="schoolDifficulties" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficultés scolaires</FormLabel>
                                <FormControl><ComboboxInput placeholder="Niveau en retard..." {...field} suggestions={schoolDifficultiesSuggestions} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="motorDifficulties" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficultés motrices et fonctionnelles</FormLabel>
                                <FormControl><ComboboxInput placeholder="Maladresse graphique..." {...field} suggestions={motorDifficultiesSuggestions} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="socioEmotionalDifficulties" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficultés socio-émotionnelles ou comportementales</FormLabel>
                                <FormControl><ComboboxInput placeholder="Crises, anxiété..." {...field} suggestions={socioEmotionalDifficultiesSuggestions} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="disabilityConstraints" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraintes liées au handicap</FormLabel>
                                <FormControl><ComboboxInput placeholder="Pauses fréquentes..." {...field} suggestions={disabilityConstraintsSuggestions} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </AccordionContent>
                </AccordionItem>
             </Accordion>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les difficultés'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
