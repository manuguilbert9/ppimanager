
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';

export const strengthsSchema = z.object({
  strengths: z.object({
    academicSkills: z.array(z.string()).optional(),
    cognitiveStrengths: z.array(z.string()).optional(),
    socialSkills: z.array(z.string()).optional(),
    exploitableInterests: z.array(z.string()).optional(),
  }).optional(),
});

interface StrengthsFormProps {
  academicSkillsSuggestions: string[];
  cognitiveStrengthsSuggestions: string[];
  socialSkillsSuggestions: string[];
  exploitableInterestsSuggestions: string[];
}

export function StrengthsForm({ 
  academicSkillsSuggestions, 
  cognitiveStrengthsSuggestions,
  socialSkillsSuggestions,
  exploitableInterestsSuggestions
}: StrengthsFormProps) {
  const form = useFormContext<z.infer<typeof strengthsSchema>>();
  
  const handleValuesChange = (values: string[] | undefined, category: 'academicSkills' | 'cognitiveStrengths' | 'socialSkills' | 'exploitableInterests') => {
      if (values) addLibraryItems(values, category);
  }

  const badgeClassName = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";

  return (
    <Card className="bg-emerald-50/50">
      <CardHeader>
        <div>
          <CardTitle>Points d'appuis</CardTitle>
          <CardDescription>
              Liste des capacités, acquis et atouts sur lesquels on peut s’appuyer pour les apprentissages.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
              <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium text-emerald-800">Points forts de l'élève</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="strengths.academicSkills" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Compétences acquises</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={academicSkillsSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'academicSkills')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="strengths.cognitiveStrengths" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Forces cognitives et comportementales</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={cognitiveStrengthsSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'cognitiveStrengths')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="strengths.socialSkills" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Habiletés sociales ou communicationnelles</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={socialSkillsSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'socialSkills')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="strengths.exploitableInterests" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Intérêts spécifiques exploitables</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={exploitableInterestsSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'exploitableInterests')}} /></FormControl>
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
