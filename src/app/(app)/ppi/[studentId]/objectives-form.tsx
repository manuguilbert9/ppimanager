'use client';

import { useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateStudent } from '@/lib/students-repository';
import { useToast } from '@/hooks/use-toast';
import type { Student, Objective } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Sparkles, Loader2, WandSparkles, RefreshCw, GripVertical } from 'lucide-react';
import { suggestObjectives, SuggestObjectivesInput } from '@/ai/flows/suggest-objectives-flow';
import { suggestAdaptations } from '@/ai/flows/suggest-adaptations-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComboboxField } from '@/components/combobox-field';
import type { DragEndEvent } from '@dnd-kit/core';
import { Separator } from '@/components/ui/separator';

const objectiveSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'L\'intitulé est requis.'),
  adaptations: z.array(z.string()).optional(),
  successCriteria: z.string().optional(),
  deadline: z.string().optional(),
  validationDate: z.string().optional(),
});

const formSchema = z.object({
  objectives: z.array(objectiveSchema),
});

interface ObjectivesFormProps {
  student: Student;
  objectivesSuggestions: string[];
  adaptationsSuggestions: string[];
}

const SortableObjectiveItem = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start w-full gap-2">
      <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 mt-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  );
};

export function ObjectivesForm({ student, objectivesSuggestions, adaptationsSuggestions }: ObjectivesFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Objective[]>([]);
  const [isSuggestingAdaptations, setIsSuggestingAdaptations] = useState<string | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objectives: (student.objectives || []).map(o => ({
        ...o,
        adaptations: Array.isArray(o.adaptations) ? o.adaptations : (typeof o.adaptations === 'string' && o.adaptations ? [o.adaptations] : []),
      })),
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control: form.control,
    name: "objectives"
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const activeObjectives = fields
    .map((field, index) => ({ field, originalIndex: index }))
    .filter(({ field, originalIndex }) => !form.watch(`objectives.${originalIndex}.validationDate`));

  const validatedObjectives = fields
    .map((field, index) => ({ field, originalIndex: index }))
    .filter(({ field, originalIndex }) => form.watch(`objectives.${originalIndex}.validationDate`));


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndexInActive = activeObjectives.findIndex((item) => item.field.id === active.id);
      const newIndexInActive = activeObjectives.findIndex((item) => item.field.id === over.id);
      
      const originalOldIndex = activeObjectives[oldIndexInActive].originalIndex;
      const originalNewIndex = activeObjectives[newIndexInActive].originalIndex;

      move(originalOldIndex, originalNewIndex);
    }
  };

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

  const handleSuggestAdaptations = async (objectiveIndex: number, objectiveId: string, appendAdaptation: (value: string) => void) => {
    const objectiveTitle = form.getValues(`objectives.${objectiveIndex}.title`);
    if (!objectiveTitle) {
      toast({
        variant: 'destructive',
        title: 'Intitulé manquant',
        description: "Veuillez d'abord saisir l'intitulé de l'objectif.",
      });
      return;
    }

    setIsSuggestingAdaptations(objectiveId);
    try {
      const result = await suggestAdaptations({ objectiveTitle });
      result.adaptations.forEach(adaptation => appendAdaptation(adaptation));
      addLibraryItems(result.adaptations, 'adaptations');

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur de suggestion',
        description: 'Une erreur est survenue lors de la suggestion d\'adaptations.',
      });
    } finally {
      setIsSuggestingAdaptations(null);
    }
  };


  const addSuggestionToForm = (suggestion: Objective) => {
    append({ 
        title: suggestion.title, 
        successCriteria: suggestion.successCriteria, 
        deadline: suggestion.deadline,
        validationDate: '',
        adaptations: Array.isArray(suggestion.adaptations) ? suggestion.adaptations : [],
    });
    setSuggestions(suggestions.filter(s => s.title !== suggestion.title));
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const objectivesToSave = values.objectives.map(o => ({
        ...o,
        adaptations: o.adaptations || [],
      }));

      await updateStudent(student.id, { objectives: objectivesToSave });
      
      if (values.objectives) {
        addLibraryItems(values.objectives.map(o => o.title), 'objectives');
        const allAdaptations = objectivesToSave.flatMap(o => o.adaptations || []);
        addLibraryItems(allAdaptations, 'adaptations');
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

  const AdaptationsFieldArray = ({ objectiveIndex, objectiveId }: { objectiveIndex: number, objectiveId: string }) => {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: `objectives.${objectiveIndex}.adaptations`,
    });

    return (
      <FormItem>
        <div className="flex items-center justify-between">
            <FormLabel>Moyens et adaptations</FormLabel>
            <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            onClick={() => handleSuggestAdaptations(objectiveIndex, objectiveId, (value) => append(value))}
            disabled={isSuggestingAdaptations === objectiveId}
            >
            {isSuggestingAdaptations === objectiveId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-4 w-4" />
            )}
            Suggérer
            </Button>
        </div>
        <div className="space-y-2">
            {fields.map((field, index) => (
            <FormField
                key={field.id}
                control={form.control}
                name={`objectives.${objectiveIndex}.adaptations.${index}`}
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center gap-2">
                        <FormControl>
                            <Input {...field} placeholder="Décrire une adaptation..." />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
            ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append('')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter une adaptation
        </Button>
      </FormItem>
    );
  };
  
  const renderObjective = (item: { field: any, originalIndex: number }, isSortable: boolean) => {
    const { field, originalIndex } = item;
    const objectiveContent = (
      <AccordionItem value={field.id} className="w-full border-purple-200 dark:border-purple-800 border rounded-md px-4 bg-purple-50 dark:bg-purple-900/20">
        <div className="flex items-center w-full">
          <AccordionTrigger className="text-lg font-medium hover:no-underline flex-1 py-3 text-purple-600 dark:text-purple-400">
            <span>{form.watch(`objectives.${originalIndex}.title`) || 'Nouvel objectif'}</span>
          </AccordionTrigger>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(originalIndex)} className="ml-2">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <AccordionContent className="space-y-4 pt-2 pb-4">
          <FormField
            control={form.control}
            name={`objectives.${originalIndex}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intitulé de l'objectif</FormLabel>
                <FormControl>
                  <ComboboxField
                    {...field}
                    placeholder="Ex: Savoir écrire lisiblement 10 mots usuels"
                    suggestions={objectivesSuggestions}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AdaptationsFieldArray objectiveIndex={originalIndex} objectiveId={item.field.id} />

          <FormField
            control={form.control}
            name={`objectives.${originalIndex}.successCriteria`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
              control={form.control}
              name={`objectives.${originalIndex}.deadline`}
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
              <FormField
              control={form.control}
              name={`objectives.${originalIndex}.validationDate`}
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Date de validation</FormLabel>
                  <FormControl>
                      <Input placeholder="JJ/MM/AAAA" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
          </div>
        </AccordionContent>
      </AccordionItem>
    );

    if (isSortable) {
      return (
        <SortableObjectiveItem key={field.id} id={field.id}>
          {objectiveContent}
        </SortableObjectiveItem>
      );
    }
    
    return (
      <div key={field.id} className="flex items-start w-full gap-2">
        <div className="p-2 mt-2">
          <div className="h-5 w-5" /> 
        </div>
        <div className="flex-grow">{objectiveContent}</div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectifs prioritaires d’apprentissage</CardTitle>
        <CardDescription>
          Objectifs individualisés, précis et évaluables, fixés pour une période donnée.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex gap-2">
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
           {suggestions.length > 0 && !isSuggesting && (
            <Button type="button" variant="outline" onClick={handleSuggestObjectives} disabled={isSuggesting}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Relancer
            </Button>
          )}
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
            <h3 className="text-xl font-semibold tracking-tight">Objectifs en cours</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={activeObjectives.map(item => item.field.id)} strategy={verticalListSortingStrategy}>
                <Accordion type="multiple" className="w-full space-y-4 border-none" defaultValue={fields.map(f => f.id)}>
                  {activeObjectives.map((item) => renderObjective(item, true))}
                </Accordion>
              </SortableContext>
            </DndContext>
            
            <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', successCriteria: '', deadline: '', validationDate: '', adaptations: [] })}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un objectif
            </Button>
            
            {validatedObjectives.length > 0 && (
                <>
                    <Separator className="my-8" />
                    <h3 className="text-xl font-semibold tracking-tight">Objectifs atteints</h3>
                    <Accordion type="multiple" className="w-full space-y-4 border-none" defaultValue={fields.map(f => f.id)}>
                        {validatedObjectives.map((item) => renderObjective(item, false))}
                    </Accordion>
                </>
            )}

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
