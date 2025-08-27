
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const notesSchema = z.object({
  notes: z.string().optional(),
});

export function NotesForm() {
  const form = useFormContext<z.infer<typeof notesSchema>>();

  return (
    <Card className="bg-yellow-50/50">
      <CardHeader>
        <CardTitle>Notes de suivi</CardTitle>
        <CardDescription>
          Espace libre pour consigner des observations, des comptes-rendus de réunion, ou toute autre information pertinente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu des notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={10}
                  placeholder="Saisissez ici vos notes de suivi..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
