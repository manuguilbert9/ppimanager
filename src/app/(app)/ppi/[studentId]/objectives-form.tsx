
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, useFormContext, Controller } from 'react-hook-form';
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
import { ComboboxInput } from '@/components/combobox-input';
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


const AdaptationsManager = ({ objectiveIndex, objectiveId, adaptationsSuggestions: librarySuggestions }: { objectiveIndex: number; objectiveId: string; adaptationsSuggestions: string[]; }) => {
    const { control, getValues } = useFormContext<z.infer<typeof formSchema>>();
    const { toast } = useToast();

    const { fields: adaptationFields, append: appendAdaptation, remove: removeAdaptation } = useFieldArray({
        control: control,
        name: `objectives.${objectiveIndex}.adaptations`,
    });

    const [adaptationSuggestions, setAdaptationSuggestions] = useState<string[]>([]);
    const [isSuggestingAdaptations, setIsSuggestingAdaptations] = useState(false);
    const [newAdaptation, setNewAdaptation] = useState('');

    const handleSuggestAdaptations = async () => {
        const objectiveTitle = getValues(`objectives.${objectiveIndex}.title`);
        if (!objectiveTitle) {
            toast({ variant: 'destructive', title: 'Intitulé manquant', description: "Veuillez d'abord saisir l'intitulé de l'objectif." });
            return;
        }

        setIsSuggestingAdaptations(true);
        try {
            const result = await suggestAdaptations({ objectiveTitle });
            const currentAdaptations = getValues(`objectives.${objectiveIndex}.adaptations`) || [];
            const newSuggestions = result.adaptations.filter(a => !currentAdaptations.includes(a));
            setAdaptationSuggestions(newSuggestions);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erreur de suggestion', description: 'Une erreur est survenue lors de la suggestion d\'adaptations.' });
        } finally {
            setIsSuggestingAdaptations(false);
        }
    };

    const addAdaptation = (adaptation: string) => {
        const trimmedAdaptation = adaptation.trim();
        if (trimmedAdaptation) {
            const currentAdaptations = getValues(`objectives.${objectiveIndex}.adaptations`) || [];
            if (!currentAdaptations.includes(trimmedAdaptation)) {
                appendAdaptation(trimmedAdaptation);
                addLibraryItems([trimmedAdaptation], 'adaptations');
            }
            setAdaptationSuggestions(prev => prev.filter(s => s !== adaptation));
        }
    };

    const handleAddClick = () => {
        addAdaptation(newAdaptation);
        setNewAdaptation('');
    };

    return (
        <FormItem>
            <div className="flex items-center justify-between">
                <FormLabel>Moyens et adaptations</FormLabel>
                <Button type="button" size="sm" variant="ghost" onClick={handleSuggestAdaptations} disabled={isSuggestingAdaptations}>
                    {isSuggestingAdaptations ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Suggérer par IA
                </Button>
            </div>

            {adaptationSuggestions.length > 0 && (
                <div className="p-3 bg-accent/50 rounded-md">
                    <p className="text-sm font-medium mb-2">Suggestions :</p>
                    <div className="flex flex-wrap gap-2">
                        {adaptationSuggestions.map((suggestion, index) => (
                            <Button key={index} type="button" variant="outline" size="sm" onClick={() => addAdaptation(suggestion)} className="h-auto whitespace-normal text-left">
                                <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {adaptationFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                        <Controller
                            control={control}
                            name={`objectives.${objectiveIndex}.adaptations.${index}`}
                            render={({ field }) => (
                                <Textarea
                                    placeholder="Décrire une adaptation..."
                                    {...field}
                                    className="min-h-[40px] flex-1"
                                />
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAdaptation(index)} className="shrink-0 mt-1">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex items-start gap-2 mt-2">
                <div className="flex-1">
                    <ComboboxInput
                        value={[]}
                        onChange={(values) => { if (values.length > 0) { addAdaptation(values[0]); } }}
                        placeholder="Rechercher ou créer une adaptation..."
                        suggestions={librarySuggestions}
                        singleSelection
                    />
                </div>
            </div>
        </FormItem>
    );
};


export function ObjectivesForm({ student, objectivesSuggestions, adaptationsSuggestions }: ObjectivesFormProps) {
  const { toast } = useToast();
  const [isSuggestingObjectives, setIsSuggestingObjectives] = useState(false);
  const [objectiveSuggestions, setObjectiveSuggestions] = useState<Objective[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objectives: (student.objectives || []).map(o => ({
        ...o,
        id: o.id || Math.random().toString(36).substring(7),
        adaptations: Array.isArray(o.adaptations) ? o.adaptations : (typeof o.adaptations === 'string' && o.adaptations ? [o.adaptations] : []),
      })),
    },
  });

  const { fields, append, remove, move } = useFieldArray({
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
    setIsSuggestingObjectives(true);
    setObjectiveSuggestions([]);
    try {
        const studentProfile: SuggestObjectivesInput = {
            strengths: student.strengths || {},
            difficulties: student.difficulties || {},
            needs: student.needs || {},
        };
        
      const result = await suggestObjectives(studentProfile);
      setObjectiveSuggestions(result.objectives);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur de suggestion',
        description: "Une erreur est survenue lors de la génération des suggestions d'objectifs.",
      });
    } finally {
      setIsSuggestingObjectives(false);
    }
  };

  const addObjectiveSuggestionToForm = (suggestion: Objective) => {
    append({ 
        id: Math.random().toString(36).substring(7),
        title: suggestion.title, 
        successCriteria: suggestion.successCriteria, 
        deadline: suggestion.deadline,
        validationDate: '',
        adaptations: Array.isArray(suggestion.adaptations) ? suggestion.adaptations : [],
    });
    setObjectiveSuggestions(objectiveSuggestions.filter(s => s.title !== suggestion.title));
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

          <AdaptationsManager 
            objectiveIndex={originalIndex} 
            objectiveId={item.field.id}
            adaptationsSuggestions={adaptationsSuggestions}
          />

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

    if (isSortable && isMounted) {
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
          <Button type="button" onClick={handleSuggestObjectives} disabled={isSuggestingObjectives}>
            {isSuggestingObjectives ? (
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
           {objectiveSuggestions.length > 0 && !isSuggestingObjectives && (
            <Button type="button" variant="outline" onClick={handleSuggestObjectives} disabled={isSuggestingObjectives}>
              <RefreshCw className="mr-2 h-4" />
              Relancer
            </Button>
          )}
        </div>
        
        {objectiveSuggestions.length > 0 && (
            <Alert className="mb-6">
                 <WandSparkles className="h-4 w-4" />
                <AlertTitle>Suggestions d'objectifs</AlertTitle>
                <AlertDescription>
                   Voici quelques suggestions générées par l'IA. Cliquez pour les ajouter.
                </AlertDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                    {objectiveSuggestions.map((suggestion, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => addObjectiveSuggestionToForm(suggestion)}>
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
            {isMounted ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={activeObjectives.map(item => item.field.id)} strategy={verticalListSortingStrategy}>
                        <Accordion type="multiple" className="w-full space-y-4 border-none" defaultValue={fields.map(f => f.id)}>
                        {activeObjectives.map((item) => renderObjective(item, true))}
                        </Accordion>
                    </SortableContext>
                </DndContext>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4 border-none" defaultValue={fields.map(f => f.id)}>
                    {activeObjectives.map((item) => renderObjective(item, false))}
                </Accordion>
            )}
            
            <Button type="button" variant="outline" size="sm" onClick={() => append({ id: Math.random().toString(36).substring(7), title: '', successCriteria: '', deadline: '', validationDate: '', adaptations: [] })}>
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
