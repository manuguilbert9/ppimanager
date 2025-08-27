
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';

export const globalProfileSchema = z.object({
  globalProfile: z.object({
      disabilityNatures: z.array(z.string()).optional(),
      associatedDisorders: z.array(z.string()).optional(),
      specifics: z.string().optional(),
      hasPAI: z.boolean().optional(),
      medicalNeeds: z.array(z.string()).optional(),
      treatments: z.string().optional(),
      equipment: z.array(z.string()).optional(),
      dailyLifeAutonomy: z.string().optional(),
      motorSkills: z.string().optional(),
      communicationSkills: z.string().optional(),
      sensorySkills: z.string().optional(),
      schoolHistory: z.string().optional(),
      hobbies: z.array(z.string()).optional(),
      personalProject: z.string().optional(),
  }).optional(),
});

interface GlobalProfileFormProps {
  disabilityNaturesSuggestions: string[];
  associatedDisordersSuggestions: string[];
  medicalNeedsSuggestions: string[];
  equipmentSuggestions: string[];
  hobbiesSuggestions: string[];
}

export function GlobalProfileForm({ 
  disabilityNaturesSuggestions,
  associatedDisordersSuggestions,
  medicalNeedsSuggestions,
  equipmentSuggestions,
  hobbiesSuggestions
}: GlobalProfileFormProps) {
  const form = useFormContext<z.infer<typeof globalProfileSchema>>();

  const handleValuesChange = (values: string[] | undefined, category: 'disabilityNatures' | 'associatedDisorders' | 'medicalNeeds' | 'equipment' | 'hobbies') => {
      if (values) addLibraryItems(values, category);
  }

  return (
    <Card className="border-l-4 border-slate-500">
      <CardHeader>
        <div>
          <CardTitle>Profil global de l’élève</CardTitle>
          <CardDescription>
            Description synthétique de la situation de handicap et du développement global.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            <Accordion type="multiple" className="w-full" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']}>
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium text-gray-700">Nature du handicap et troubles associés</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField control={form.control} name="globalProfile.disabilityNatures" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnostics principaux</FormLabel>
                      <FormControl><ComboboxInput {...field} suggestions={disabilityNaturesSuggestions} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'disabilityNatures')}} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="globalProfile.associatedDisorders" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autres troubles ou déficiences associées</FormLabel>
                      <FormControl><ComboboxInput {...field} suggestions={associatedDisordersSuggestions} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'associatedDisorders')}} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="globalProfile.specifics" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spécificités (degré, latéralité, etc.)</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium text-gray-700">Santé et besoins médicaux</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <FormField control={form.control} name="globalProfile.medicalNeeds" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Besoins médicaux spécifiques</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={medicalNeedsSuggestions} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'medicalNeeds')}} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="globalProfile.equipment" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Appareillages</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={equipmentSuggestions} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'equipment')}} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="space-y-4">
                            <FormField control={form.control} name="globalProfile.treatments" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Traitements médicaux réguliers</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="globalProfile.hasPAI" render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Un PAI (Projet d'Accueil Individualisé) est en place</FormLabel>
                                    </div>
                                </FormItem>
                            )} />
                        </div>
                   </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium text-gray-700">Développement et autonomie</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="globalProfile.dailyLifeAutonomy" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Autonomie dans les actes de la vie quotidienne</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="globalProfile.motorSkills" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Compétences motrices</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="globalProfile.communicationSkills" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacités de communication</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="globalProfile.sensorySkills" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacités sensorielles</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium text-gray-700">Histoire scolaire et parcours</AccordionTrigger>
                <AccordionContent className="pt-4">
                    <FormField control={form.control} name="globalProfile.schoolHistory" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Résumé du parcours scolaire antérieur</FormLabel>
                            <FormControl><Textarea rows={5} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium text-gray-700">Centres d’intérêt et projet personnel</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="globalProfile.hobbies" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Centres d'intérêt et points de motivation</FormLabel>
                            <FormControl><ComboboxInput {...field} suggestions={hobbiesSuggestions} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'hobbies')}} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="globalProfile.personalProject" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Esquisse du projet d’avenir ou professionnel</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
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
