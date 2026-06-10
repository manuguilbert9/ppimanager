'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { PpiFormValues } from './page';

export const academicLevelsSchema = z.object({
  academicLevels: z
    .array(
      z.object({
        id: z.string().optional(),
        domain: z.string().min(1, 'Le domaine est requis.'),
        level: z.string().optional(),
        comment: z.string().optional(),
      })
    )
    .optional(),
});

const DEFAULT_DOMAINS = [
  'Langage oral',
  'Lecture',
  'Écriture / production d\'écrits',
  'Nombres et calcul',
  'Résolution de problèmes',
  'Espace et géométrie',
  'Autonomie',
  'Vie sociale',
];

export function AcademicLevelsForm() {
  const form = useFormContext<PpiFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'academicLevels',
  });

  const addDefaults = () => {
    const existing = new Set((form.getValues('academicLevels') || []).map((l) => l.domain));
    for (const domain of DEFAULT_DOMAINS) {
      if (!existing.has(domain)) {
        append({ id: Math.random().toString(36).substring(7), domain, level: '', comment: '' });
      }
    }
  };

  return (
    <Card className="border-l-4 border-indigo-500">
      <CardHeader>
        <CardTitle>Évaluation diagnostique : niveaux scolaires</CardTitle>
        <CardDescription>
          Positionner l'élève par domaine d'apprentissage, en référence aux programmes et au socle commun.
          Un élève peut ne pas avoir un profil homogène et relever de cycles différents selon les domaines
          (par exemple CE1 en lecture et CM1 en mathématiques) : ces dysharmonies sont fréquentes et
          guideront les groupes de besoin et les inclusions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun domaine renseigné pour le moment.
          </p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_1fr_2fr_auto]">
            <FormField
              control={form.control}
              name={`academicLevels.${index}.domain`}
              render={({ field }) => (
                <FormItem>
                  {index === 0 && <FormLabel>Domaine</FormLabel>}
                  <FormControl><Input {...field} placeholder="Lecture" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`academicLevels.${index}.level`}
              render={({ field }) => (
                <FormItem>
                  {index === 0 && <FormLabel>Niveau / cycle de référence</FormLabel>}
                  <FormControl><Input {...field} placeholder="Cycle 2 – mi-CE1" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`academicLevels.${index}.comment`}
              render={({ field }) => (
                <FormItem>
                  {index === 0 && <FormLabel>Acquis et observations</FormLabel>}
                  <FormControl><Input {...field} placeholder="Décode les mots simples, comprend un texte lu par un tiers..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={index === 0 ? 'mt-8' : ''}
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ id: Math.random().toString(36).substring(7), domain: '', level: '', comment: '' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un domaine
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={addDefaults}>
            Pré-remplir les domaines usuels
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
