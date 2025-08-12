'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, GlobalProfile } from '@/types';
import { TagInput } from './tag-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';

const formSchema = z.object({
  disabilityNature: z.string().optional(),
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

export function GlobalProfileForm({ student }: { student: Student }) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disabilityNature: student.globalProfile?.disabilityNature || '',
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const globalProfile: GlobalProfile = values;
      await updateStudent(student.id, { globalProfile });
      
      // Add new tags to library
      if (values.disabilityNature) {
        await addLibraryItems([values.disabilityNature], 'disabilityNatures');
      }
      if (values.associatedDisorders && values.associatedDisorders.length > 0) {
        await addLibraryItems(values.associatedDisorders, 'associatedDisorders');
      }
      if (values.equipment && values.equipment.length > 0) {
        await addLibraryItems(values.equipment, 'equipments');
      }
      if (values.hobbies && values.hobbies.length > 0) {
        await addLibraryItems(values.hobbies, 'hobbies');
      }
      if (values.medicalNeeds && values.medicalNeeds.length > 0) {
        await addLibraryItems(values.medicalNeeds, 'medicalNeeds');
      }

      toast({
        title: 'Profil mis à jour',
        description: `Le profil de ${student.firstName} ${student.lastName} a été enregistré.`,
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
        <CardTitle>Profil global de l’élève</CardTitle>
        <CardDescription>
          Description synthétique de la situation de handicap et du développement global.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']} className="w-full">
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">Nature du handicap et troubles associés</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField control={form.control} name="disabilityNature" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnostic principal</FormLabel>
                      <FormControl><Input placeholder="Ex: Paralysie cérébrale, TSA..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="associatedDisorders" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autres troubles ou déficiences associées</FormLabel>
                      <FormControl><TagInput {...field} placeholder="Ajouter un trouble..." /></FormControl>
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
                <AccordionTrigger className="text-lg font-medium">Santé et besoins médicaux</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <FormField control={form.control} name="medicalNeeds" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Besoins médicaux spécifiques</FormLabel>
                                <FormControl><TagInput {...field} placeholder="Ajouter un besoin..." /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="equipment" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Appareillages</FormLabel>
                                <FormControl><TagInput {...field} placeholder="Ajouter un appareillage..." /></FormControl>
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
                <AccordionTrigger className="text-lg font-medium">Développement et autonomie</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="dailyLifeAutonomy" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Autonomie dans les actes de la vie quotidienne</FormLabel>
                            <FormControl><Textarea placeholder="Toilette, habillage, repas..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="motorSkills" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Compétences motrices</FormLabel>
                            <FormControl><Textarea placeholder="Marche, usage d'un fauteuil, préhension..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="communicationSkills" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacités de communication</FormLabel>
                            <FormControl><Textarea placeholder="Langage oral, LSF, PECS, etc." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="sensorySkills" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacités sensorielles</FormLabel>
                            <FormControl><Textarea placeholder="Acuité visuelle/auditive, port de lunettes/appareil..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">Histoire scolaire et parcours</AccordionTrigger>
                <AccordionContent className="pt-4">
                    <FormField control={form.control} name="schoolHistory" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Résumé du parcours scolaire antérieur</FormLabel>
                            <FormControl><Textarea rows={5} placeholder="Milieu ordinaire ou spécialisé, transitions, niveau..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">Centres d’intérêt et projet personnel</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="hobbies" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Centres d'intérêt et points de motivation</FormLabel>
                            <FormControl><TagInput {...field} placeholder="Ajouter un centre d'intérêt..." /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="personalProject" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Esquisse du projet d’avenir ou professionnel</FormLabel>
                            <FormControl><Textarea placeholder="Pour un adolescent, s'il a exprimé des envies..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Sauvegarde...' : 'Sauvegarder le profil'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
