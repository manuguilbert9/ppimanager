'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComboboxInput } from '@/components/combobox-input';
import { OBSERVATION_DOMAINS } from '@/lib/egron/observation-grid';
import { Eye, Info } from 'lucide-react';
import type { PpiFormValues } from './page';

const observationEntrySchema = z.object({
  facts: z.string().optional(),
  needs: z.array(z.string()).optional(),
});

export const observationsSchema = z.object({
  observations: z
    .record(
      z.object({
        entries: z.record(observationEntrySchema).optional(),
        synthesis: z.string().optional(),
      })
    )
    .optional(),
});

function countDomainEntries(
  observations: PpiFormValues['observations'],
  domainId: string
): number {
  const domain = observations?.[domainId];
  if (!domain?.entries) return 0;
  return Object.values(domain.entries).filter(
    (e) => (e?.facts && e.facts.trim().length > 0) || (e?.needs && e.needs.length > 0)
  ).length;
}

export function ObservationForm() {
  const form = useFormContext<PpiFormValues>();
  const observations = form.watch('observations');

  return (
    <Card className="border-l-4 border-teal-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-teal-600" />
          Grille d'observation des fonctionnements
        </CardTitle>
        <CardDescription>
          Le cœur de la démarche : observer pour identifier les besoins. L'observation récolte
          uniquement des faits, décrits sans jugement de valeur ni interprétation, dans une pluralité de
          situations et avec une pluralité de regards (parents, AESH, professionnels de soin...).
          Pour chaque item pertinent pour l'élève, notez les faits observés puis les besoins éventuels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-teal-50/50">
          <Info className="h-4 w-4" />
          <AlertTitle>Conseils de la démarche</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
              <li>Ne renseignez que les items pertinents pour l'élève : il ne s'agit pas de cocher des cases.</li>
              <li>Le premier geste : vérifier que le fonctionnement sensorimoteur est opérationnel, avant d'évoquer d'autres pistes.</li>
              <li>Ne délaissez pas le fonctionnement cognitif et les processus d'apprentissage : ce sont les champs les plus utiles à l'enseignant.</li>
              <li>Attention au biais de confirmation : observez toutes les causes possibles, sans diagnostic préétabli.</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Accordion type="multiple" className="w-full">
          {OBSERVATION_DOMAINS.map((domain) => {
            const filled = countDomainEntries(observations, domain.id);
            return (
              <AccordionItem key={domain.id} value={domain.id}>
                <AccordionTrigger className="text-lg font-medium text-teal-800">
                  <div className="flex items-center gap-3">
                    {domain.title}
                    {filled > 0 && (
                      <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">
                        {filled} item{filled > 1 ? 's' : ''} renseigné{filled > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-2">
                  <p className="text-sm italic text-muted-foreground">{domain.description}</p>
                  {domain.items.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-muted/20 p-4">
                      <h4 className="font-medium">{item.label}</h4>
                      <p className="mb-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-semibold">Observables : </span>
                        {item.observables}
                      </p>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`observations.${domain.id}.entries.${item.id}.facts`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Faits observés</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  {...field}
                                  value={field.value || ''}
                                  placeholder="Décrire des faits et évènements précis, sans jugement (ex. : ne va pas au bout du travail en mathématiques, mais le fait en sciences)."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`observations.${domain.id}.entries.${item.id}.needs`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Besoins éventuels (dans la sphère scolaire)</FormLabel>
                              <FormControl>
                                <ComboboxInput
                                  value={field.value || []}
                                  onChange={field.onChange}
                                  suggestions={item.needs.map((n) => `Besoin ${n}`)}
                                  placeholder="Sélectionner ou saisir un besoin..."
                                  badgeClassName="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <FormField
                    control={form.control}
                    name={`observations.${domain.id}.synthesis`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Synthèse et analyse du champ « {domain.title} »
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            {...field}
                            value={field.value || ''}
                            placeholder="L'interprétation des faits se fait dans un second temps, en croisant les regards. Que retient-on de ce champ pour cet élève ?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
