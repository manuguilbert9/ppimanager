'use client';

import { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OBSERVATION_DOMAINS } from '@/lib/egron/observation-grid';
import { GripVertical, ListOrdered, PlusCircle, Trash2 } from 'lucide-react';
import type { PpiFormValues } from './page';

export const priorityNeedsSchema = z.object({
  priorityNeeds: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1, "L'intitulé du besoin est requis."),
        domain: z.string().optional(),
        rationale: z.string().optional(),
      })
    )
    .optional(),
});

function SortableNeedItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex w-full items-start gap-2">
      <div {...attributes} {...listeners} className="mt-3 cursor-grab touch-none p-1">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  );
}

export function PriorityNeedsForm() {
  const form = useFormContext<PpiFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'priorityNeeds',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const observations = form.watch('observations');
  const priorityNeeds = form.watch('priorityNeeds') || [];

  // Besoins cochés dans la grille d'observation, non encore retenus comme prioritaires.
  const candidateNeeds = useMemo(() => {
    const retained = new Set(priorityNeeds.map((n) => n.label));
    const candidates: { label: string; domain: string }[] = [];
    const seen = new Set<string>();
    for (const domain of OBSERVATION_DOMAINS) {
      const entries = observations?.[domain.id]?.entries;
      if (!entries) continue;
      for (const entry of Object.values(entries)) {
        for (const need of entry?.needs || []) {
          if (!retained.has(need) && !seen.has(need)) {
            seen.add(need);
            candidates.push({ label: need, domain: domain.title });
          }
        }
      }
    }
    return candidates;
  }, [observations, priorityNeeds]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const addCandidate = (candidate: { label: string; domain: string }) => {
    append({
      id: Math.random().toString(36).substring(7),
      label: candidate.label,
      domain: candidate.domain,
      rationale: '',
    });
  };

  return (
    <Card className="border-l-4 border-sky-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-sky-600" />
          Besoins prioritaires retenus
        </CardTitle>
        <CardDescription>
          « Tous les besoins ne sont pas d'un même niveau, il est nécessaire de faire des choix parmi
          ceux-ci, les temps de scolarisation parfois courts le nécessitent. » Hiérarchisez ici les besoins
          retenus pour la période : ils fonderont les objectifs prioritaires de l'étape suivante. Glissez-déposez
          pour ordonner du plus prioritaire au moins prioritaire.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {candidateNeeds.length > 0 && (
          <Alert>
            <AlertTitle>Besoins identifiés dans la grille d'observation</AlertTitle>
            <AlertDescription>Cliquez pour retenir un besoin comme prioritaire.</AlertDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              {candidateNeeds.map((candidate, i) => (
                <Button
                  key={i}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto whitespace-normal text-left"
                  onClick={() => addCandidate(candidate)}
                >
                  <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
                  <span>
                    {candidate.label}
                    <span className="ml-1 text-xs text-muted-foreground">({candidate.domain})</span>
                  </span>
                </Button>
              ))}
            </div>
          </Alert>
        )}

        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun besoin prioritaire retenu pour le moment. Renseignez la grille d'observation, utilisez la
            suggestion IA de l'étape Besoins, ou ajoutez un besoin manuellement.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <SortableNeedItem key={field.id} id={field.id}>
                    <div className="rounded-lg border bg-sky-50/40 p-3">
                      <div className="flex items-start gap-3">
                        <Badge className="mt-2 shrink-0 bg-sky-600 hover:bg-sky-600">{index + 1}</Badge>
                        <div className="grid flex-grow grid-cols-1 gap-3 lg:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`priorityNeeds.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Besoin</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`priorityNeeds.${index}.rationale`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Pourquoi ce besoin est prioritaire</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} placeholder="Besoin récurrent, conditionne les autres apprentissages..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </SortableNeedItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ id: Math.random().toString(36).substring(7), label: '', domain: '', rationale: '' })
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un besoin prioritaire
        </Button>
      </CardContent>
    </Card>
  );
}
