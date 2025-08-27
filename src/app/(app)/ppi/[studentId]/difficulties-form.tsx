
'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';

export const difficultiesSchema = z.object({
  difficulties: z.object({
    cognitiveDifficulties: z.array(z.string()).optional(),
    schoolDifficulties: z.array(z.string()).optional(),
    motorDifficulties: z.array(z.string()).optional(),
    socioEmotionalDifficulties: z.array(z.string()).optional(),
    disabilityConstraints: z.array(z.string()).optional(),
  }).optional(),
});

interface DifficultiesFormProps {
  cognitiveDifficultiesSuggestions: string[];
  schoolDifficultiesSuggestions: string[];
  motorDifficultiesSuggestions: string[];
  socioEmotionalDifficultiesSuggestions: string[];
  disabilityConstraintsSuggestions: string[];
}


export function DifficultiesForm({ 
  cognitiveDifficultiesSuggestions,
  schoolDifficultiesSuggestions,
  motorDifficultiesSuggestions,
  socioEmotionalDifficultiesSuggestions,
  disabilityConstraintsSuggestions,
}: DifficultiesFormProps) {
  const form = useFormContext<z.infer<typeof difficultiesSchema>>();

  const handleValuesChange = (values: string[] | undefined, category: 'cognitiveDifficulties' | 'schoolDifficulties' | 'motorDifficulties' | 'socioEmotionalDifficulties' | 'disabilityConstraints') => {
      if (values) addLibraryItems(values, category);
  }

  const badgeClassName = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  return (
    <Card className="border-l-4 border-red-500">
      <CardHeader>
        <div>
          <CardTitle>Difficultés de l’élève</CardTitle>
          <CardDescription>
              Identification des obstacles et limitations qui impactent ses apprentissages.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
              <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium text-red-800">Points de vigilance</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="difficulties.cognitiveDifficulties" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Difficultés cognitives</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={cognitiveDifficultiesSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'cognitiveDifficulties')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="difficulties.schoolDifficulties" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Difficultés scolaires</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={schoolDifficultiesSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'schoolDifficulties')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="difficulties.motorDifficulties" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Difficultés motrices et fonctionnelles</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={motorDifficultiesSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'motorDifficulties')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="difficulties.socioEmotionalDifficulties" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Difficultés socio-émotionnelles ou comportementales</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={socioEmotionalDifficultiesSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'socioEmotionalDifficulties')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="difficulties.disabilityConstraints" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Contraintes liées au handicap</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={disabilityConstraintsSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'disabilityConstraints')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                  </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
