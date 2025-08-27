
'use client';

import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export type SaveStatus = 'unsaved' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
}

const statusConfig: Record<SaveStatus, { text: string; icon: React.ReactNode; className: string; }> = {
  unsaved: {
    text: 'Modifications non enregistrées',
    icon: <Save className="h-4 w-4" />,
    className: 'text-muted-foreground',
  },
  saving: {
    text: 'Enregistrement...',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    className: 'text-blue-600',
  },
  saved: {
    text: 'Enregistré',
    icon: <CheckCircle className="h-4 w-4" />,
    className: 'text-green-600',
  },
  error: {
    text: 'Erreur',
    icon: <AlertCircle className="h-4 w-4" />,
    className: 'text-destructive',
  },
};

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${config.className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
