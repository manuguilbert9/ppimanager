
'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Difficulties, Needs, Strengths } from '@/types';
import { ComboboxInput } from '@/components/combobox-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { addLibraryItems } from '@/lib/library-repository';
import { Sparkles, Loader2, PlusCircle, WandSparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestNeeds, SuggestNeedsInput, SuggestNeedsOutput } from '@/ai/flows/suggest-needs-flow';
import { useToast } from '@/hooks/use-toast';
import type { PpiFormValues } from './page';

export const needsSchema = z.object({
  needs: z.object({
    pedagogicalAccommodations: z.array(z.string()).optional(),
    humanAssistance: z.array(z.string()).optional(),
    compensatoryTools: z.array(z.string()).optional(),
    specialEducationalApproach: z.array(z.string()).optional(),
    complementaryCare: z.array(z.string()).optional(),
  }).optional(),
});

interface NeedsFormProps {
  pedagogicalAccommodationsSuggestions: string[];
  humanAssistanceSuggestions: string[];
  compensatoryToolsSuggestions: string[];
  specialEducationalApproachSuggestions: string[];
  complementaryCareSuggestions: string[];
}

const SuggestionSection = ({ title, suggestions, onAdd }: { title: string; suggestions: string[]; onAdd: (suggestion: string) => void; }) => {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAdd(suggestion)}
            className="h-auto whitespace-normal text-left"
          >
            <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
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

const sanitizeNeedsOutput = (output: SuggestNeedsOutput): SuggestNeedsOutput => ({
  pedagogicalAccommodations: sanitizeStringArray(output.pedagogicalAccommodations),
  humanAssistance: sanitizeStringArray(output.humanAssistance),
  compensatoryTools: sanitizeStringArray(output.compensatoryTools),
  specialEducationalApproach: sanitizeStringArray(output.specialEducationalApproach),
  complementaryCare: sanitizeStringArray(output.complementaryCare),
});

export function NeedsForm({
  pedagogicalAccommodationsSuggestions,
  humanAssistanceSuggestions,
  compensatoryToolsSuggestions,
  specialEducationalApproachSuggestions,
  complementaryCareSuggestions,
}: NeedsFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestNeedsOutput | null>(null);

  const form = useFormContext<PpiFormValues>();

  const handleSuggestNeeds = async () => {
    setIsSuggesting(true);
    setSuggestions(null);
    try {
      const studentProfile: SuggestNeedsInput = {
        strengths: sanitizeSection<Strengths | undefined>(form.getValues('strengths') as Strengths | undefined),
        difficulties: sanitizeSection<Difficulties | undefined>(form.getValues('difficulties') as Difficulties | undefined),
      };
      
      console.log('DEBUG: Données envoyées à l\'IA (côté client)', JSON.stringify(studentProfile, null, 2));

      const result = await suggestNeeds(studentProfile);
      setSuggestions(sanitizeNeedsOutput(result));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur de suggestion',
        description: "Une erreur est survenue lors de la génération des suggestions de besoins.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const addSuggestion = (suggestion: string, field: keyof Needs) => {
    const fieldName = `needs.${field}` as const;
    const currentValues = form.getValues(fieldName) || [];
    const trimmedSuggestion = suggestion.trim();
    if (!trimmedSuggestion) {
      return;
    }
    if (!currentValues.includes(trimmedSuggestion)) {
      const updatedValues = [...currentValues, trimmedSuggestion];
      form.setValue(fieldName, updatedValues, { shouldDirty: true });
      addLibraryItems([trimmedSuggestion], field); // Add to library as well
    }
    // Remove from suggestions list to avoid clutter
    if (suggestions) {
      setSuggestions({
        ...suggestions,
        [field]: suggestions[field]?.filter(s => s !== suggestion) || [],
      });
    }
  };
  
  const handleValuesChange = (values: string[] | undefined, category: keyof Needs) => {
    const sanitized = sanitizeStringArray(values);
    if (sanitized.length > 0) {
      addLibraryItems(sanitized, category);
    }
  };

  const badgeClassName = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";

  return (
    <Card className="border-l-4 border-sky-500">
      <CardHeader>
        <div>
          <CardTitle>Besoins éducatifs particuliers</CardTitle>
          <CardDescription>
              Liste des besoins spécifiques de l’élève pour compenser son handicap et progresser.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex gap-2">
            <Button type="button" onClick={handleSuggestNeeds} disabled={isSuggesting}>
                {isSuggesting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                </>
                ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Suggérer des besoins par IA
                </>
                )}
            </Button>
        </div>

        {suggestions && (
          <Alert className="mb-6">
            <WandSparkles className="h-4 w-4" />
            <AlertTitle>Suggestions de besoins</AlertTitle>
            <AlertDescription>
                Voici quelques suggestions générées par l'IA. Cliquez pour les ajouter aux champs correspondants.
            </AlertDescription>
            <div className="mt-4 space-y-4">
              <SuggestionSection
                title="Aménagements pédagogiques"
                suggestions={suggestions.pedagogicalAccommodations}
                onAdd={(s) => addSuggestion(s, 'pedagogicalAccommodations')}
              />
              <SuggestionSection
                title="Aide humaine"
                suggestions={suggestions.humanAssistance}
                onAdd={(s) => addSuggestion(s, 'humanAssistance')}
              />
               <SuggestionSection
                title="Outils de compensation"
                suggestions={suggestions.compensatoryTools}
                onAdd={(s) => addSuggestion(s, 'compensatoryTools')}
              />
               <SuggestionSection
                title="Approche éducative particulière"
                suggestions={suggestions.specialEducationalApproach}
                onAdd={(s) => addSuggestion(s, 'specialEducationalApproach')}
              />
               <SuggestionSection
                title="Soins ou rééducations complémentaires"
                suggestions={suggestions.complementaryCare}
                onAdd={(s) => addSuggestion(s, 'complementaryCare')}
              />
            </div>
          </Alert>
        )}

        <div className="space-y-8">
            <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
              <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium text-sky-800">Identifier les besoins</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="needs.pedagogicalAccommodations" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Besoin d’aménagements pédagogiques</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={pedagogicalAccommodationsSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'pedagogicalAccommodations')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="needs.humanAssistance" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Besoin d’aide humaine</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={humanAssistanceSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'humanAssistance')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="needs.compensatoryTools" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Besoin d’outils de compensation</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={compensatoryToolsSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'compensatoryTools')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="needs.specialEducationalApproach" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Besoin en approche éducative particulière</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={specialEducationalApproachSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'specialEducationalApproach')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="needs.complementaryCare" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Besoin de soins ou rééducations complémentaires</FormLabel>
                              <FormControl><ComboboxInput {...field} suggestions={complementaryCareSuggestions} badgeClassName={badgeClassName} onChange={(v) => { field.onChange(v); handleValuesChange(v, 'complementaryCare')}} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                  </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
