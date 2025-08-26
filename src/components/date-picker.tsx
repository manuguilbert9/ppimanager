
'use client';

import * as React from 'react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!value) return undefined;
    try {
      return parse(value, 'dd/MM/yyyy', new Date());
    } catch (e) {
      return undefined;
    }
  });

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onChange(format(selectedDate, 'dd/MM/yyyy'));
    } else {
      onChange('');
    }
  };

  React.useEffect(() => {
    try {
      if (value) {
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        setDate(parsedDate);
      } else {
        setDate(undefined);
      }
    } catch (e) {
      setDate(undefined);
    }
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP', { locale: fr }) : <span>{placeholder || 'Choisir une date'}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={fr}
        />
      </PopoverContent>
    </Popover>
  );
}
