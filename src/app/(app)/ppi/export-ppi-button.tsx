'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateDocx } from '@/lib/docx-exporter';
import { FileDown, Loader2 } from 'lucide-react';
import { getStudent } from '@/lib/students-repository';


export function ExportPpiButton({ studentId }: { studentId: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const student = await getStudent(studentId);
        if (!student) {
            throw new Error("Student not found");
        }
        
        const blob = await generateDocx(student);

        // Create a link and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `PPI_${student.lastName}_${student.firstName}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      toast({
        title: 'Exportation réussie',
        description: `Le fichier Word pour ${student.firstName} ${student.lastName} a été téléchargé.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'exportation",
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      Exporter
    </Button>
  );
}
