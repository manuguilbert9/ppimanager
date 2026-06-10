'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComboboxInput } from '@/components/combobox-input';
import { DatePicker } from '@/components/date-picker';
import { CalendarCheck, Info, PlusCircle, Trash2 } from 'lucide-react';
import type { PpiFormValues } from './page';

export const evaluationSchema = z.object({
  evaluationPlan: z
    .object({
      modalities: z.string().optional(),
      tools: z.array(z.string()).optional(),
      communication: z.string().optional(),
    })
    .optional(),
  reviews: z
    .array(
      z.object({
        id: z.string().optional(),
        date: z.string().optional(),
        progress: z.string().optional(),
        adjustments: z.string().optional(),
      })
    )
    .optional(),
});

const TOOL_SUGGESTIONS = [
  'Portefeuille de compétences',
  'Livret de réussite',
  'Arbre des connaissances',
  'Système de points',
  'Livret de compétences illustré (pictogrammes, photos)',
  'Carnet de suivi des comportements',
  'Évaluations nationales adaptées',
  'Grille d\'évaluation individualisée',
];

export function EvaluationForm() {
  const form = useFormContext<PpiFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'reviews',
  });

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-fuchsia-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-fuchsia-600" />
            Modalités d'évaluation des progrès
          </CardTitle>
          <CardDescription>
            Principes : détacher l'évaluation du travail de celle de la personne, associer l'élève à son
            évaluation dans un vocabulaire qu'il comprend, n'évaluer que les compétences acquises, pointer
            régulièrement les progrès et les capitaliser sans faire table rase à chaque période.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="evaluationPlan.modalities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalités d'évaluation retenues</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    {...field}
                    value={field.value || ''}
                    placeholder="Évaluation continue au fil des acquisitions plutôt que situations sommatives stressantes ; observation pendant le travail, analyse des productions, entretiens sur les procédures..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="evaluationPlan.tools"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Outils de capitalisation des progrès</FormLabel>
                <FormControl>
                  <ComboboxInput
                    value={field.value || []}
                    onChange={field.onChange}
                    suggestions={TOOL_SUGGESTIONS}
                    badgeClassName="bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="evaluationPlan.communication"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Communication des progrès à l'élève et à la famille</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    {...field}
                    value={field.value || ''}
                    placeholder="Vocabulaire simple compréhensible par l'enfant et les parents, pictogrammes ou photos pour les non-lecteurs, transmission régulière à la famille..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="border-l-4 border-fuchsia-500">
        <CardHeader>
          <CardTitle>Bilans périodiques et régulation du projet</CardTitle>
          <CardDescription>
            Le PPI est un document vivant : à chaque bilan, on fait le point sur les progrès, on interroge la
            pertinence des objectifs et des adaptations en place (ceux qui sont opérants, ceux qui n'ont pas
            fonctionné ou ne fonctionnent plus), et on ajuste.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Aucun bilan pour le moment</AlertTitle>
              <AlertDescription>
                Ajoutez un bilan à chaque point d'étape (période, trimestre, ESS...).
              </AlertDescription>
            </Alert>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border bg-fuchsia-50/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium">Bilan {index + 1}</h4>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr_1fr]">
                <FormField
                  control={form.control}
                  name={`reviews.${index}.date`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`reviews.${index}.progress`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progrès observés</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} value={field.value || ''} placeholder="Compétences acquises, évolutions comportementales..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`reviews.${index}.adjustments`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ajustements décidés</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} value={field.value || ''} placeholder="Objectifs révisés, adaptations modifiées, nouvelles priorités..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ id: Math.random().toString(36).substring(7), date: '', progress: '', adjustments: '' })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un bilan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
