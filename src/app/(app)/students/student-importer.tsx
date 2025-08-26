
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import * as xlsx from 'xlsx';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { importStudents } from '@/lib/students-repository';
import type { ImportedStudent } from '@/types';

interface StudentImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function StudentImporter({ open, onOpenChange, onSuccess }: StudentImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!file) {
      toast({ variant: 'destructive', title: 'Aucun fichier sélectionné' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data, { type: 'buffer' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
          throw new Error("Le fichier Excel est vide ou ne contient que des en-têtes.");
      }

      const headers = (jsonData[0] as string[]).map(h => h.toLowerCase().trim());
      const lastNameIndex = headers.indexOf('nom');
      const firstNameIndex = headers.indexOf('prénom');
      const birthDateIndex = headers.indexOf('date de naissance');
      const classIndex = headers.indexOf('classe');
      
      if (lastNameIndex === -1 || firstNameIndex === -1 || classIndex === -1) {
          throw new Error("Les colonnes requises ('Nom', 'Prénom', 'Classe') sont introuvables.");
      }

      const studentsToImport: ImportedStudent[] = [];
      for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          const lastName = row[lastNameIndex];
          const firstName = row[firstNameIndex];
          const className = row[classIndex];

          if (lastName && firstName && className) {
                let birthDate = row[birthDateIndex];
                if (typeof birthDate === 'number') { // Excel date serial number
                    const excelEpoch = new Date(1899, 11, 30);
                    const jsDate = new Date(excelEpoch.getTime() + birthDate * 86400000);
                    birthDate = `${jsDate.getDate().toString().padStart(2, '0')}/${(jsDate.getMonth() + 1).toString().padStart(2, '0')}/${jsDate.getFullYear()}`;
                }

                studentsToImport.push({
                    lastName: String(lastName).trim(),
                    firstName: String(firstName).trim(),
                    birthDate: birthDate ? String(birthDate).trim() : undefined,
                    className: String(className).trim(),
                });
          }
      }
      
      const result = await importStudents(studentsToImport);
      toast({
        title: 'Importation terminée',
        description: `${result.added} élèves ajoutés, ${result.skipped} ignorés (doublons).`,
      });
      
      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      console.error("Import Error:", error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'importation",
        description: error.message || 'Une erreur est survenue.',
        duration: 9000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setFile(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer des élèves depuis Excel</DialogTitle>
          <DialogDescription>
            Le fichier doit contenir les colonnes "Nom", "Prénom" et "Classe". "Date de naissance" est optionnel.
          </DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={`mt-4 border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {file ? (
                <>
                    <File className="h-10 w-10" />
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-xs">({(file.size / 1024).toFixed(2)} KB)</p>
                </>
            ) : (
                <>
                    <Upload className="h-10 w-10" />
                    <p>Glissez-déposez un fichier ici, ou cliquez pour sélectionner</p>
                    <p className="text-xs">(.xlsx ou .xls)</p>
                </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleImport} disabled={isLoading || !file}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Importer le fichier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
