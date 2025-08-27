
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '@/components/rich-text-editor';

export const notesSchema = z.object({
  notes: z.string().optional(),
});

export function NotesForm() {
  const form = useFormContext<z.infer<typeof notesSchema>>();

  return (
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="h-full flex flex-col">
              <FormLabel>Contenu des notes</FormLabel>
              <FormControl className="flex-grow">
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Saisissez ici vos notes de suivi..."
                  className="min-h-[250px] h-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  );
}
