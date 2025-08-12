'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, Objective, Strengths, Difficulties, Needs } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Sparkles, Loader2, WandSparkles } from 'lucide-react';
import { suggestObjectives, SuggestObjectivesInput } from '@/ai/flows/suggest-objectives-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const objectiveSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'L\'intitulé est requis.'),
  successCriteria: z.string().optional(),
  deadline: z.string().optional(),
});

const formSchema = z.object({
  objectives: z.array(objectiveSchema),
});

interface ObjectivesFormProps {
  student: Student;
  objectivesSuggestions: string[];
}

export function ObjectivesForm({ student, objectivesSuggestions }: ObjectivesFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Objective[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objectives: student.objectives || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "objectives"
  });

  const handleSuggestObjectives = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
        const studentProfile: SuggestObjectivesInput = {
            strengths: student.strengths || {},
            difficulties: student.difficulties || {},
            needs: student.needs || {},
        };
        
      const result = await suggestObjectives(studentProfile);
      setSuggestions(result.objectives);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur de suggestion',
        description: "Une erreur est survenue lors de la génération des suggestions d'objectifs.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const addSuggestionToForm = (suggestion: Objective) => {
    append({ 
        title: suggestion.title, 
        successCriteria: suggestion.successCriteria, 
        deadline: suggestion.deadline 
    });
    setSuggestions(suggestions.filter(s => s.title !== suggestion.title));
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateStudent(student.id, { objectives: values.objectives });
      if (values.objectives) {
        addLibraryItems(values.objectives.map(o => o.title), 'objectives');
      }
      toast({
        title: 'Objectifs mis à jour',
        description: `Les objectifs de ${student.firstName} ${student.lastName} ont été enregistrés.`,
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
        <CardTitle>Objectifs prioritaires d’apprentissage</CardTitle>
        <CardDescription>
          Objectifs individualisés, précis et évaluables, fixés pour une période donnée.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button type="button" onClick={handleSuggestObjectives} disabled={isSuggesting}>
            {isSuggesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Suggérer des objectifs par IA
              </>
            )}
          </Button>
        </div>
        
        {suggestions.length > 0 && (
            <Alert className="mb-6">
                 <WandSparkles className="h-4 w-4" />
                <AlertTitle>Suggestions d'objectifs</AlertTitle>
                <AlertDescription>
                   Voici quelques suggestions générées par l'IA. Cliquez pour les ajouter.
                </AlertDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => addSuggestionToForm(suggestion)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {suggestion.title}
                        </Button>
                    ))}
                </div>
            </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Accordion type="multiple" className="w-full">
              {fields.map((field, index) => (
                <AccordionItem value={field.id} key={field.id}>
                  <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span>Objectif #{index + 1}: {form.watch(`objectives.${index}.title`) || 'Nouvel objectif'}</span>
                       <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); remove(index); }} >
                          <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name={`objectives.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intitulé de l'objectif</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Savoir écrire lisiblement 10 mots usuels" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`objectives.${index}.successCriteria`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Critère de réussite attendue</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ex: Réussite dans 4 cas sur 5..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`objectives.${index}.deadline`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Échéance</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Fin du trimestre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', successCriteria: '', deadline: '' })}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un objectif
            </Button>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les objectifs'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
