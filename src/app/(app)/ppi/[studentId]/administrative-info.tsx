'use client';

import type { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, School, Calendar, FileText } from 'lucide-react';

interface InfoFieldProps {
  icon: React.ElementType;
  label: string;
  value?: string;
}

const InfoField = ({ icon: Icon, label, value }: InfoFieldProps) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-4">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
        </div>
    );
};

export function AdministrativeInfo({ student }: { student: Student }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations administratives</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
            <InfoField icon={User} label="Nom et Prénom" value={`${student.firstName} ${student.lastName}`} />
            <InfoField icon={Calendar} label="Date de naissance" value={student.birthDate} />
            <InfoField icon={School} label="Classe" value={student.className} />
            <InfoField icon={User} label="Enseignant(e)" value={student.teacherName} />
            <InfoField icon={FileText} label="Notification MDPH" value={student.mdphNotificationTitle} />
            <InfoField icon={Calendar} label="Échéance MDPH" value={student.mdphNotificationExpiration} />
        </div>
      </CardContent>
    </Card>
  );
}
