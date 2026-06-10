'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MailCheck } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Veuillez saisir une adresse e-mail valide.' }),
});

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await resetPassword(values.email);
      setSentTo(values.email);
      setEmailSent(true);
    } catch (error: any) {
      console.error(error);
      // Par sécurité, on ne révèle pas si l'adresse existe ou non :
      // un compte inconnu affiche le même écran de confirmation.
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-email') {
        setSentTo(values.email);
        setEmailSent(true);
        return;
      }
      if (error?.code === 'auth/too-many-requests') {
        toast({
          variant: 'destructive',
          title: 'Trop de tentatives',
          description: 'Veuillez patienter quelques minutes avant de réessayer.',
        });
        return;
      }
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "L'e-mail de réinitialisation n'a pas pu être envoyé. Veuillez réessayer.",
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Saisissez l'adresse e-mail de votre compte : vous recevrez un lien pour
            définir un nouveau mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <Alert>
              <MailCheck className="h-4 w-4" />
              <AlertTitle>E-mail envoyé</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Si un compte existe pour <span className="font-medium">{sentTo}</span>,
                  un e-mail de réinitialisation vient de lui être envoyé.
                </p>
                <p className="text-sm text-muted-foreground">
                  Pensez à vérifier votre dossier de courriers indésirables. Le lien est
                  valable une heure.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setEmailSent(false);
                    form.reset({ email: sentTo });
                  }}
                >
                  Renvoyer l'e-mail
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="nom@exemple.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? 'Envoi en cours...'
                    : 'Envoyer le lien de réinitialisation'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter>
          <Link
            href="/login"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à la connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
