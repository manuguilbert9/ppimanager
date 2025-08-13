
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ComboboxFieldProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function ComboboxField({
  value = '',
  onChange,
  placeholder,
  suggestions = [],
}: ComboboxFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || '');

  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleSelect = (item: string) => {
    const trimmedItem = item.trim();
    onChange(trimmedItem);
    setInputValue(trimmedItem);
    setOpen(false);
  };
  
  const handleInputChange = (text: string) => {
    setInputValue(text);
    onChange(text);
  }

  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  const showCreateOption = inputValue.trim() && !filteredSuggestions.some(s => s.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {value || placeholder || ""}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Rechercher ou créer..."
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>Aucun résultat.</CommandEmpty>
            <CommandGroup>
              {showCreateOption && (
                  <CommandItem
                      onSelect={() => handleSelect(inputValue)}
                      className="flex items-center gap-2"
                      >
                      <PlusCircle className="h-4 w-4" />
                      <span>Créer "{inputValue}"</span>
                  </CommandItem>
              )}
              {filteredSuggestions.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={() => handleSelect(item)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
