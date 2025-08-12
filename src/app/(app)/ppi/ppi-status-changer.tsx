'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updatePpiStatus } from '@/lib/ppi-repository';
import type { Ppi, PpiStatus } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2 } from 'lucide-react';

const statusConfig = {
  draft: {
    variant: 'secondary',
    text: 'Brouillon',
    next: 'validated',
  },
  validated: {
    variant: 'default',
    text: 'Validé',
    next: 'archived',
  },
  archived: {
    variant: 'outline',
    text: 'Archivé',
    next: 'draft',
  },
} as const;

export function PpiStatusChanger({ ppi }: { ppi: Ppi }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: PpiStatus) => {
    setIsUpdating(true);
    try {
      await updatePpiStatus(ppi.studentId, newStatus);
      toast({
        title: 'Statut mis à jour',
        description: `Le statut du PPI de ${ppi.studentName} est maintenant "${statusConfig[newStatus].text}".`,
      });
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

  const currentStatus = ppi.status;
  const config = statusConfig[currentStatus];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto"
          disabled={isUpdating}
        >
          <Badge variant={config.variant} className="cursor-pointer">
            {isUpdating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {config.text}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(statusConfig).map(([statusKey, statusValue]) => (
          <DropdownMenuItem
            key={statusKey}
            disabled={currentStatus === statusKey || isUpdating}
            onSelect={() => handleStatusChange(statusKey as PpiStatus)}
          >
            Passer à "{statusValue.text}"
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
