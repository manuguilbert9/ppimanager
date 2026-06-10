'use client';

import { useState, useEffect } from 'react';
import { useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Strengths, Difficulties, Needs, Objective } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Sparkles, Loader2, WandSparkles, RefreshCw, GripVertical } from 'lucide-react';
import { suggestObjectives, SuggestObjectivesInput, SuggestObjectivesOutput } from '@/ai/flows/suggest-objectives-flow';
import { suggestAdaptations } from '@/ai/flows/suggest-adaptations-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComboboxField } from '@/components/combobox-field';
import { ComboboxInput } from '@/components/combobox-input';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/date-picker';
import type { PpiFormValues } from './page';

const objectiveSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'L\'intitulé est requis.'),
  domain: z.string().optional(),
  competenceRef: z.string().optional(),
  means: z.array(z.string()).optional(),
  adaptations: z.array(z.string()).optional(),
  successCriteria: z.string().optional(),
  deadline: z.string().optional(),
  validationDate: z.string().optional(),
  status: z.enum(['in_progress', 'achieved', 'partial', 'abandoned']).optional(),
  evaluation: z.string().optional(),
});

export const objectivesSchema = z.object({
  objectives: z.array(objectiveSchema),
});

const OBJECTIVE_DOMAINS = [
  'Français – langage oral',
  'Français – lecture',
  'Français – écriture',
  'Mathématiques – nombres et calcul',
  'Mathématiques – résolution de problèmes',
  'Mathématiques – espace et géométrie',
  'Questionner le monde / sciences',
  'EPS',
  'Arts',
  'Transversal – autonomie',
  'Transversal – socialisation / vivre ensemble',
  'Transversal – méthodologie / processus d\'apprentissage',
  'Transversal – communication',
  'Projet professionnel',
];

const MEANS_SUGGESTIONS = [
  'Manipulation accompagnée d\'une verbalisation de la démarche',
  'Travail en petit groupe de besoin',
  'Séances courtes et régulières',
  'Entretien d\'explicitation sur les procédures',
  'Supports visuels et pictogrammes',
  'Tutorat par un pair',
  'Situations finalisées et projets',
  'Rituels et cadres prévisibles',
  'Outils numériques (ordinateur, logiciels adaptés)',
  'Renforcement positif et contrat',
];

interface ObjectivesFormProps {
  objectivesSuggestions: string[];
  adaptationsSuggestions: string[];
}

const SortableObjectiveItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-start w-full gap-2">
      <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 mt-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  );
};

const AdaptationsManager = ({ objectiveIndex, adaptationsSuggestions: librarySuggestions }: { objectiveIndex: number; adaptationsSuggestions: string[]; }) => {
    const { user } = useAuth();
    const { getValues, setValue, control, watch } = useFormContext<PpiFormValues>();
    const { toast } = useToast();

    const adaptations: string[] = watch(`objectives.${objectiveIndex}.adaptations`) || [];

    const removeAdaptation = (index: number) => {
        const current = getValues(`objectives.${objectiveIndex}.adaptations`) || [];
        setValue(
            `objectives.${objectiveIndex}.adaptations`,
            current.filter((_, i) => i !== index),
            { shouldDirty: true }
        );
    };

    const [adaptationSuggestions, setAdaptationSuggestions] = useState<string[]>([]);
    const [isSuggestingAdaptations, setIsSuggestingAdaptations] = useState(false);

    const handleSuggestAdaptations = async () => {
        const objectiveTitle = getValues(`objectives.${objectiveIndex}.title`);
        if (!objectiveTitle) {
            toast({ variant: 'destructive', title: 'Intitulé manquant', description: "Veuillez d'abord saisir l'intitulé de l'objectif." });
            return;
        }

        setIsSuggestingAdaptations(true);
        try {
            const result = await suggestAdaptations({
                objectiveTitle,
                troubleIds: getValues('troubleIds') || [],
                priorityNeeds: (getValues('priorityNeeds') || []).map((n) => n.label),
                userId: user?.uid,
            });
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
                setValue(`objectives.${objectiveIndex}.adaptations`, [...currentAdaptations, trimmedAdaptation], { shouldDirty: true });
                addLibraryItems([trimmedAdaptation], 'adaptations', user!.uid);
            }
            setAdaptationSuggestions(prev => prev.filter(s => s !== adaptation));
        }
    };

    return (
        <FormItem>
            <div className="flex items-center justify-between">
                <FormLabel>Adaptations (ancrées dans les pistes du référentiel)</FormLabel>
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
                {adaptations.map((_, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <Controller
                            control={control}
                            name={`objectives.${objectiveIndex}.adaptations.${index}`}
                            render={({ field }) => (
                                <Textarea
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

const sanitizeStringArray = (values?: string[]) => {
  if (!values) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );
};

const sanitizeSection = <T extends Record<string, string[] | undefined> | undefined>(section: T): T | undefined => {
  if (!section) {
    return undefined;
  }

  const sanitizedEntries = Object.entries(section).reduce((acc, [key, value]) => {
    const sanitized = sanitizeStringArray(value as string[] | undefined);
    if (sanitized.length > 0) {
      (acc as Record<string, string[]>)[key] = sanitized;
    }
    return acc;
  }, {} as Record<string, string[]>);

  if (Object.keys(sanitizedEntries).length === 0) {
    return undefined;
  }

  return sanitizedEntries as T;
};

export function ObjectivesForm({ objectivesSuggestions, adaptationsSuggestions }: ObjectivesFormProps) {
  const { toast } = useToast();
  const [isSuggestingObjectives, setIsSuggestingObjectives] = useState(false);
  const [objectiveSuggestions, setObjectiveSuggestions] = useState<SuggestObjectivesOutput['objectives']>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useFormContext<PpiFormValues>();

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
    .filter(({ originalIndex }) => !form.watch(`objectives.${originalIndex}.validationDate`));

  const validatedObjectives = fields
    .map((field, index) => ({ field, originalIndex: index }))
    .filter(({ originalIndex }) => form.watch(`objectives.${originalIndex}.validationDate`));

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
            strengths: sanitizeSection<Strengths | undefined>(form.getValues('strengths') as Strengths | undefined),
            difficulties: sanitizeSection<Difficulties | undefined>(form.getValues('difficulties') as Difficulties | undefined),
            needs: sanitizeSection<Needs | undefined>(form.getValues('needs') as Needs | undefined),
            priorityNeeds: (form.getValues('priorityNeeds') || [])
              .map((n) => n.label)
              .filter((l) => l && l.trim().length > 0),
            academicLevels: (form.getValues('academicLevels') || [])
              .filter((l) => l.domain)
              .map((l) => `${l.domain} : ${l.level || 'non précisé'}${l.comment ? ` (${l.comment})` : ''}`),
            troubleIds: form.getValues('troubleIds') || [],
        };

      const result = await suggestObjectives(studentProfile);
      const existingObjectiveTitles = new Set(
        (form.getValues('objectives') || [])
          .map((objective) => objective?.title?.trim().toLowerCase())
          .filter((title): title is string => Boolean(title))
      );

      const sanitizedSuggestions = result.objectives
        .filter((suggestion) => suggestion.title.trim().length > 0)
        .filter((suggestion) => !existingObjectiveTitles.has(suggestion.title.trim().toLowerCase()));

      setObjectiveSuggestions(sanitizedSuggestions);
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

  const addObjectiveSuggestionToForm = (suggestion: SuggestObjectivesOutput['objectives'][number]) => {
    append({
        id: Math.random().toString(36).substring(7),
        title: suggestion.title.trim(),
        domain: suggestion.domain?.trim() || '',
        competenceRef: suggestion.competenceRef?.trim() || '',
        means: Array.isArray(suggestion.means) ? suggestion.means : [],
        successCriteria: suggestion.successCriteria?.trim() || '',
        deadline: suggestion.deadline?.trim() || '',
        validationDate: '',
        adaptations: [],
        status: 'in_progress',
        evaluation: '',
    });
    const normalizedTitle = suggestion.title.trim().toLowerCase();
    setObjectiveSuggestions(
      objectiveSuggestions.filter((s) => s.title.trim().toLowerCase() !== normalizedTitle)
    );
  };

  const renderObjective = (item: { field: any, originalIndex: number }, isSortable: boolean) => {
    const { field, originalIndex } = item;
    const domain = form.watch(`objectives.${originalIndex}.domain`);
    const objectiveContent = (
      <AccordionItem value={field.id} className="w-full bg-background/50 border-purple-200 dark:border-purple-800 border rounded-md px-4">
        <div className="flex items-center w-full">
          <AccordionTrigger className="text-lg font-medium hover:no-underline flex-1 py-3 text-purple-800">
            <div className="flex items-center gap-2 text-left">
              {domain && <Badge variant="outline" className="shrink-0 bg-purple-50 text-purple-700">{domain}</Badge>}
              <span>{form.watch(`objectives.${originalIndex}.title`) || 'Nouvel objectif'}</span>
            </div>
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
                  <FormLabel>Intitulé de l'objectif (verbe d'action, observable)</FormLabel>
                  <FormControl>
                    <ComboboxField
                      {...field}
                      suggestions={objectivesSuggestions}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`objectives.${originalIndex}.domain`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domaine d'apprentissage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un domaine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OBJECTIVE_DOMAINS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`objectives.${originalIndex}.competenceRef`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compétence visée (programmes / socle commun)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Ex. : Lire et comprendre une consigne simple (cycle 2)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`objectives.${originalIndex}.means`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Démarches, moyens et supports</FormLabel>
                  <FormControl>
                    <ComboboxInput
                      value={field.value || []}
                      onChange={field.onChange}
                      suggestions={MEANS_SUGGESTIONS}
                      placeholder="Comment travailler cet objectif..."
                      badgeClassName="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AdaptationsManager
              objectiveIndex={originalIndex}
              adaptationsSuggestions={adaptationsSuggestions}
            />

            <FormField
              control={form.control}
              name={`objectives.${originalIndex}.successCriteria`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Critère de réussite attendue (simple et observable)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`objectives.${originalIndex}.deadline`}
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Échéance</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`objectives.${originalIndex}.status`}
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Statut</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || 'in_progress'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in_progress">En cours</SelectItem>
                              <SelectItem value="partial">Partiellement atteint</SelectItem>
                              <SelectItem value="achieved">Atteint</SelectItem>
                              <SelectItem value="abandoned">Suspendu / révisé</SelectItem>
                            </SelectContent>
                          </Select>
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
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name={`objectives.${originalIndex}.evaluation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bilan de l'objectif</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} rows={2} placeholder="Progrès constatés, obstacles rencontrés, ce qui a fonctionné..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
    <Card className="border-l-4 border-purple-500">
      <CardHeader>
        <div>
          <CardTitle>Objectifs prioritaires d’apprentissage</CardTitle>
          <CardDescription>
            Pour chaque besoin prioritaire retenu : un objectif référé aux programmes et au socle commun,
            opérationnalisé (verbe d'action, critère de réussite observable, échéance), avec les démarches,
            moyens et supports pour l'atteindre. Les objectifs du socle ne sont pas modifiés : c'est le
            programme d'enseignement qui est ajusté pour aider l'élève à les atteindre.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
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
                    Suggestions construites à partir des besoins prioritaires et des niveaux scolaires. Cliquez pour ajouter.
                    </AlertDescription>
                    <div className="mt-4 space-y-2">
                        {objectiveSuggestions.map((suggestion, index) => (
                            <Button key={index} variant="outline" size="sm" onClick={() => addObjectiveSuggestionToForm(suggestion)} className="h-auto w-full justify-start whitespace-normal text-left">
                                <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
                                <span>
                                  <span className="font-medium">{suggestion.title}</span>
                                  {suggestion.domain && <span className="ml-2 text-xs text-muted-foreground">({suggestion.domain})</span>}
                                </span>
                            </Button>
                        ))}
                    </div>
                </Alert>
            )}

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

            <Button type="button" variant="outline" size="sm" onClick={() => append({ id: Math.random().toString(36).substring(7), title: '', domain: '', competenceRef: '', means: [], successCriteria: '', deadline: '', validationDate: '', adaptations: [], status: 'in_progress', evaluation: '' })}>
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

        </div>
      </CardContent>
    </Card>
  );
}
