'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TROUBLES, TROUBLE_CATEGORIES, getTroubles } from '@/lib/egron/troubles';
import { BookOpen, Lightbulb } from 'lucide-react';
import type { PpiFormValues } from './page';

export const troublesSchema = z.object({
  troubleIds: z.array(z.string()).optional(),
});

export function TroublesForm() {
  const form = useFormContext<PpiFormValues>();
  const selectedIds: string[] = form.watch('troubleIds') || [];
  const selectedTroubles = getTroubles(selectedIds);

  const toggleTrouble = (id: string, checked: boolean) => {
    const current: string[] = form.getValues('troubleIds') || [];
    const next = checked ? Array.from(new Set([...current, id])) : current.filter((t) => t !== id);
    form.setValue('troubleIds', next, { shouldDirty: true });
  };

  return (
    <Card className="border-l-4 border-amber-500">
      <CardHeader>
        <CardTitle>Troubles et répercussions sur les apprentissages</CardTitle>
        <CardDescription>
          La connaissance du trouble est un inducteur de l'observation : elle permet de comprendre une partie
          du fonctionnement de l'élève et de suggérer des types d'adaptations. Mais elle ne suffit jamais :
          chaque enfant présente une variété des conséquences d'un trouble, et beaucoup sont porteurs de
          plusieurs troubles. L'identification fine des besoins passe par l'observation (étape suivante).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="troubleIds"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TROUBLE_CATEGORIES.map((category) => (
                  <div key={category} className="rounded-lg border p-4">
                    <h4 className="mb-3 text-sm font-semibold text-amber-800">{category}</h4>
                    <div className="space-y-2">
                      {TROUBLES.filter((t) => t.category === category).map((trouble) => (
                        <label key={trouble.id} className="flex items-start gap-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={selectedIds.includes(trouble.id)}
                            onCheckedChange={(checked) => toggleTrouble(trouble.id, checked === true)}
                            className="mt-0.5"
                          />
                          <span>{trouble.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedTroubles.length > 0 && (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertTitle>Repères : incidences et pistes pédagogiques</AlertTitle>
            <AlertDescription>
              Synthèse issue de l'ouvrage de référence (B. Egron, <em>Enseigner en unité d'enseignement</em>, Retz).
              Ces repères guideront l'observation, les besoins et les adaptations proposés plus loin.
            </AlertDescription>
            <Accordion type="multiple" className="mt-4 w-full">
              {selectedTroubles.map((trouble) => (
                <AccordionItem key={trouble.id} value={trouble.id}>
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-800">{trouble.category}</Badge>
                      {trouble.label}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground italic">{trouble.notion}</p>
                    <div>
                      <h5 className="mb-2 text-sm font-semibold">Incidences sur les apprentissages</h5>
                      <ul className="list-disc space-y-1 pl-5 text-sm">
                        {trouble.incidences.map((inc, i) => (
                          <li key={i}>{inc}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                        <Lightbulb className="h-4 w-4 text-amber-600" /> Pistes pédagogiques
                      </h5>
                      <div className="space-y-3">
                        {trouble.pistes.map((theme, i) => (
                          <div key={i}>
                            <p className="text-sm font-medium text-amber-900">{theme.theme}</p>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {theme.items.map((item, j) => (
                                <li key={j}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
