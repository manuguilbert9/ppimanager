
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updatePpiStatus } from '@/lib/ppi-repository';
import { duplicatePpi } from '@/lib/students-repository';
import type { Ppi, PpiStatus } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const statusConfig: Record<PpiStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive', text: string }> = {
  draft: {
    variant: 'secondary',
    text: 'Brouillon',
  },
  validated: {
    variant: 'default',
    text: 'Validé',
  },
  archived: {
    variant: 'outline',
    text: 'Archivé',
  },
  to_create: {
    variant: 'destructive',
    text: 'À créer',
  },
};


export function PpiStatusChanger({ ppi, onStatusChanged, as, children, className }: { ppi: Ppi; onStatusChanged: () => void; as?: 'button'; children?: React.ReactNode, className?: string; }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusChange = async (newStatus: PpiStatus) => {
    setIsUpdating(true);
    try {
      await updatePpiStatus(ppi.studentId, newStatus);
      toast({
        title: 'Statut mis à jour',
        description: `Le statut du PPI de ${ppi.studentName} est maintenant "${statusConfig[newStatus].text}".`,
      });
      onStatusChanged();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du statut.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDuplicate = async () => {
    setIsUpdating(true);
    try {
      await duplicatePpi(ppi.studentId);
      toast({
        title: 'Nouveau PPI créé',
        description: `Un nouveau brouillon de PPI a été créé pour ${ppi.studentName}.`,
      });
      router.push('/ppi'); // Redirect to PPI list after duplication
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la duplication du PPI.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = ppi.status;
  const config = statusConfig[currentStatus];

  if (currentStatus === 'to_create') {
    return (
        <Badge variant={config.variant} className={cn("cursor-pointer", className)}>
          {config.text}
        </Badge>
    );
  }

  const triggerContent = as === 'button' ? (
    <Button variant="outline" size="lg" className={cn("shadow-lg", className)} disabled={isUpdating}>
        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Statut : {config.text}
    </Button>
    ) : (
        <Button
          variant="ghost"
          size="sm"
          className={cn("p-0 h-auto", className)}
          disabled={isUpdating}
        >
          <Badge variant={config.variant} className="cursor-pointer">
            {isUpdating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {config.text}
          </Badge>
        </Button>
  );


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(statusConfig).filter(([statusKey]) => statusKey !== 'to_create').map(([statusKey, statusValue]) => (
          <DropdownMenuItem
            key={statusKey}
            disabled={currentStatus === statusKey || isUpdating}
            onSelect={() => handleStatusChange(statusKey as PpiStatus)}
          >
            Passer à "{statusValue.text}"
          </DropdownMenuItem>
        ))}
        {currentStatus === 'archived' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isUpdating}
              onSelect={handleDuplicate}
            >
              Créer un nouveau PPI
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
