'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { updateClasse } from '@/lib/classes-repository';
import type { Classe } from '@/types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Le nom de la classe est requis.',
  }),
});

export function EditClasseForm({ classe }: { classe: Classe }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: classe.name,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateClasse(classe.id, values);
      toast({
        title: 'Classe modifiée',
        description: `La classe ${values.name} a été mise à jour avec succès.`,
      });
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erreur lors de la modification de la classe",
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Modifier la classe
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier la classe</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de la classe ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la classe</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: CM2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Modification en cours...'
                  : 'Enregistrer les modifications'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
