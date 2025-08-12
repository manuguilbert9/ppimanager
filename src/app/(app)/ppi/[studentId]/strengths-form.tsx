'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, Strengths } from '@/types';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicSkills: student.strengths?.academicSkills || [],
      cognitiveStrengths: student.strengths?.cognitiveStrengths || [],
      socialSkills: student.strengths?.socialSkills || [],
      exploitableInterests: student.strengths?.exploitableInterests || [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const strengths: Strengths = values;
      await updateStudent(student.id, { strengths });
      
      // Add new tags to the library, without waiting for the result
      if (values.academicSkills) addLibraryItems(values.academicSkills, 'academicSkills');
      if (values.cognitiveStrengths) addLibraryItems(values.cognitiveStrengths, 'cognitiveStrengths');
      if (values.socialSkills) addLibraryItems(values.socialSkills, 'socialSkills');
      if (values.exploitableInterests) addLibraryItems(values.exploitableInterests, 'exploitableInterests');
      
      toast({
        title: 'Points forts mis à jour',
        description: `Les points forts de ${student.firstName} ${student.lastName} ont été enregistrés.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
      });
    }
  }

  const badgeClassName = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points d'appuis</CardTitle>
        <CardDescription>
            Liste des capacités, acquis et atouts sur lesquels on peut s’appuyer pour les apprentissages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-medium text-green-600 dark:text-green-500">Points forts de l'élève</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="academicSkills" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Compétences académiques acquises</FormLabel>
                                <FormControl><ComboboxInput placeholder="Sait reconnaître les lettres..." {...field} suggestions={academicSkillsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="cognitiveStrengths" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Forces cognitives et comportementales</FormLabel>
                                <FormControl><ComboboxInput placeholder="Bonne mémoire visuelle..." {...field} suggestions={cognitiveStrengthsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="socialSkills" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Habiletés sociales ou communicationnelles préservées</FormLabel>
                                <FormControl><ComboboxInput placeholder="Cherche à entrer en interaction..." {...field} suggestions={socialSkillsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="exploitableInterests" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Intérêts spécifiques exploitables</FormLabel>
                                <FormControl><ComboboxInput placeholder="Passion pour la musique..." {...field} suggestions={exploitableInterestsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </AccordionContent>
                </AccordionItem>
             </Accordion>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les points forts'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
