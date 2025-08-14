
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, GlobalProfile } from '@/types';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2, CheckCircle } from 'lucide-react';

const formSchema = z.object({
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
});

interface GlobalProfileFormProps {
  student: Student;
  disabilityNaturesSuggestions: string[];
  associatedDisordersSuggestions: string[];
  medicalNeedsSuggestions: string[];
  equipmentSuggestions: string[];
  hobbiesSuggestions: string[];
}

export function GlobalProfileForm({ 
  student, 
  disabilityNaturesSuggestions,
  associatedDisordersSuggestions,
  medicalNeedsSuggestions,
  equipmentSuggestions,
  hobbiesSuggestions
}: GlobalProfileFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disabilityNatures: student.globalProfile?.disabilityNatures || [],
      associatedDisorders: student.globalProfile?.associatedDisorders || [],
      specifics: student.globalProfile?.specifics || '',
      hasPAI: student.globalProfile?.hasPAI || false,
      medicalNeeds: student.globalProfile?.medicalNeeds || [],
      treatments: student.globalProfile?.treatments || '',
      equipment: student.globalProfile?.equipment || [],
      dailyLifeAutonomy: student.globalProfile?.dailyLifeAutonomy || '',
      motorSkills: student.globalProfile?.motorSkills || '',
      communicationSkills: student.globalProfile?.communicationSkills || '',
      sensorySkills: student.globalProfile?.sensorySkills || '',
      schoolHistory: student.globalProfile?.schoolHistory || '',
      hobbies: student.globalProfile?.hobbies || [],
      personalProject: student.globalProfile?.personalProject || '',
    },
  });

  const watchedValues = form.watch();
  const debouncedValues = useDebounce(watchedValues, 1500);

  const saveForm = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const globalProfile: GlobalProfile = values;
      await updateStudent(student.id, { globalProfile });

      if (values.disabilityNatures) addLibraryItems(values.disabilityNatures, 'disabilityNatures');
      if (values.associatedDisorders) addLibraryItems(values.associatedDisorders, 'associatedDisorders');
      if (values.medicalNeeds) addLibraryItems(values.medicalNeeds, 'medicalNeeds');
      if (values.equipment) addLibraryItems(values.equipment, 'equipment');
      if (values.hobbies) addLibraryItems(values.hobbies, 'hobbies');
      
      form.reset(values); // Reset form with new values to mark it as "clean"
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
  }, [student.id, toast, form]);


  useEffect(() => {
    if (form.formState.isDirty) {
      saveForm(debouncedValues);
    }
  }, [debouncedValues, form.formState.isDirty, saveForm]);


  return (
    <Card className="bg-gray-50/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Profil global de l’élève</CardTitle>
          <CardDescription>
            Description synthétique de la situation de handicap et du développement global.
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
            <Accordion type="multiple" className="w-full" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']}>
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium text-gray-700">Nature du handicap et troubles associés</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField control={form.control} name="disabilityNatures" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnostics principaux</FormLabel>
                      <FormControl><ComboboxInput {...field} suggestions={disabilityNaturesSuggestions} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="associatedDisorders" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autres troubles ou déficiences associées</FormLabel>
                      <FormControl><ComboboxInput {...field} suggestions={associatedDisordersSuggestions} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="specifics" render={({ field }) => (
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
                            <FormField control={form.control} name="medicalNeeds" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Besoins médicaux spécifiques</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={medicalNeedsSuggestions} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="equipment" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Appareillages</FormLabel>
                                <FormControl><ComboboxInput {...field} suggestions={equipmentSuggestions} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="space-y-4">
                            <FormField control={form.control} name="treatments" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Traitements médicaux réguliers</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="hasPAI" render={({ field }) => (
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
                    <FormField control={form.control} name="dailyLifeAutonomy" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Autonomie dans les actes de la vie quotidienne</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="motorSkills" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Compétences motrices</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="communicationSkills" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacités de communication</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="sensorySkills" render={({ field }) => (
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
                    <FormField control={form.control} name="schoolHistory" render={({ field }) => (
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
                    <FormField control={form.control} name="hobbies" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Centres d'intérêt et points de motivation</FormLabel>
                            <FormControl><ComboboxInput {...field} suggestions={hobbiesSuggestions} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="personalProject" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Esquisse du projet d’avenir ou professionnel</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
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
