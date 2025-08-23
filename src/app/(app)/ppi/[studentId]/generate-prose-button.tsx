
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateProseDocx } from '@/lib/prose-docx-exporter';
import { FileText, Loader2 } from 'lucide-react';
import type { Student } from '@/types';

export function GenerateProseButton({ student }: { student: Partial<Student> }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateProseDocx(student as Student);

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Ecrit_${student.lastName}_${student.firstName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Génération réussie',
        description: `Le fichier Word pour ${student.firstName} ${student.lastName} a été téléchargé.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de la génération",
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Générer un écrit
        </>
      )}
    </Button>
  );
}
