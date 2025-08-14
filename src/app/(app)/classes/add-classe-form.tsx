
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
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
import { addClasse } from '@/lib/classes-repository';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Le nom de la classe est requis.',
  }),
  teacherName: z.string().min(1, {
    message: "Le nom de l'enseignant est requis.",
  }),
});

interface AddClasseFormProps {
  onClasseAdded: () => void;
}

export function AddClasseForm({ onClasseAdded }: AddClasseFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      teacherName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addClasse(values);
      toast({
        title: 'Classe ajoutée',
        description: `La classe ${values.name} a été ajoutée avec succès.`,
      });
      form.reset();
      setOpen(false);
      onClasseAdded(); // Refresh data on parent
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'ajout de la classe",
        description:
          'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une classe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle classe</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour ajouter une nouvelle classe.
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
               <FormField
                control={form.control}
                name="teacherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'enseignant</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Mr. Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
