'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, Needs } from '@/types';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';

const formSchema = z.object({
  pedagogicalAccommodations: z.array(z.string()).optional(),
  humanAssistance: z.array(z.string()).optional(),
  compensatoryTools: z.array(z.string()).optional(),
  specialEducationalApproach: z.array(z.string()).optional(),
  complementaryCare: z.array(z.string()).optional(),
});

interface NeedsFormProps {
  student: Student;
  pedagogicalAccommodationsSuggestions: string[];
  humanAssistanceSuggestions: string[];
  compensatoryToolsSuggestions: string[];
  specialEducationalApproachSuggestions: string[];
  complementaryCareSuggestions: string[];
}

export function NeedsForm({
  student,
  pedagogicalAccommodationsSuggestions,
  humanAssistanceSuggestions,
  compensatoryToolsSuggestions,
  specialEducationalApproachSuggestions,
  complementaryCareSuggestions,
}: NeedsFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pedagogicalAccommodations: student.needs?.pedagogicalAccommodations || [],
      humanAssistance: student.needs?.humanAssistance || [],
      compensatoryTools: student.needs?.compensatoryTools || [],
      specialEducationalApproach: student.needs?.specialEducationalApproach || [],
      complementaryCare: student.needs?.complementaryCare || [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const needs: Needs = values;
      await updateStudent(student.id, { needs });
      
      // Add new tags to the library
      if (values.pedagogicalAccommodations) addLibraryItems(values.pedagogicalAccommodations, 'pedagogicalAccommodations');
      if (values.humanAssistance) addLibraryItems(values.humanAssistance, 'humanAssistance');
      if (values.compensatoryTools) addLibraryItems(values.compensatoryTools, 'compensatoryTools');
      if (values.specialEducationalApproach) addLibraryItems(values.specialEducationalApproach, 'specialEducationalApproach');
      if (values.complementaryCare) addLibraryItems(values.complementaryCare, 'complementaryCare');
      
      toast({
        title: 'Besoins mis à jour',
        description: `Les besoins de ${student.firstName} ${student.lastName} ont été enregistrés.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
      });
    }
  }

  const badgeClassName = "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";

  return (
    <Card style={{ backgroundColor: '#d0ebe8' }}>
      <CardHeader>
        <CardTitle>Besoins éducatifs particuliers</CardTitle>
        <CardDescription>
            Liste des besoins spécifiques de l’élève pour compenser son handicap et progresser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-medium text-teal-800">Identifier les besoins</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="pedagogicalAccommodations" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Besoin d’aménagements pédagogiques</FormLabel>
                                <FormControl><ComboboxInput placeholder="Documents en gros caractères..." {...field} suggestions={pedagogicalAccommodationsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="humanAssistance" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Besoin d’aide humaine</FormLabel>
                                <FormControl><ComboboxInput placeholder="Présence d’un AESH..." {...field} suggestions={humanAssistanceSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="compensatoryTools" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Besoin d’outils de compensation</FormLabel>
                                <FormControl><ComboboxInput placeholder="Ordinateur avec synthèse vocale..." {...field} suggestions={compensatoryToolsSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="specialEducationalApproach" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Besoin en approche éducative particulière</FormLabel>
                                <FormControl><ComboboxInput placeholder="Structuration visuelle type TEACCH..." {...field} suggestions={specialEducationalApproachSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="complementaryCare" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Besoin de soins ou rééducations complémentaires</FormLabel>
                                <FormControl><ComboboxInput placeholder="Séances d’orthophonie..." {...field} suggestions={complementaryCareSuggestions} badgeClassName={badgeClassName} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </AccordionContent>
                </AccordionItem>
             </Accordion>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les besoins'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
