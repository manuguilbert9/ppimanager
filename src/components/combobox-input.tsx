
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface DragConfig {
  category: string;
  draggedItem?: {
    value: string;
    category: string;
  } | null;
  onDragStart: (value: string, category: string) => void;
  onDragEnd: () => void;
  onDrop: (category: string) => void;
}

interface ComboboxInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  badgeClassName?: string;
  singleSelection?: boolean;
  dragConfig?: DragConfig;
}

const ComboboxInput = React.forwardRef<HTMLButtonElement, ComboboxInputProps>(
  ({
    value = [],
    onChange,
    placeholder,
    suggestions = [],
    badgeClassName,
    singleSelection = false,
    dragConfig,
  }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleUnselect = (item: string) => {
      onChange(value.filter((i) => i !== item));
    };

    const handleSelect = (item: string) => {
      const trimmedItem = item.trim();
      if (trimmedItem) {
          if (singleSelection) {
              onChange([trimmedItem]);
          } else if (!value.includes(trimmedItem)) {
              onChange([...value, trimmedItem]);
          }
      }
      setInputValue('');
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
          e.preventDefault();
          handleSelect(inputValue);
      }
    };

    const filteredSuggestions = suggestions.filter(
      (item) =>
        !value.includes(item) &&
        item.toLowerCase().includes(inputValue.toLowerCase())
    );

    const showCreateOption = inputValue.trim() && !filteredSuggestions.some(s => s.toLowerCase() === inputValue.trim().toLowerCase());

    const allowDrop =
      dragConfig?.draggedItem &&
      dragConfig.draggedItem.category !== dragConfig.category;

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      if (!dragConfig || !allowDrop) {
        return;
      }
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = () => {
      if (!dragConfig) {
        return;
      }
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      if (!dragConfig || !allowDrop) {
        return;
      }
      e.preventDefault();
      setIsDragOver(false);
      dragConfig.onDrop(dragConfig.category);
    };

    return (
      <div className="flex flex-col gap-2">
         <Popover open={open} onOpenChange={setOpen}>
          <div className="flex gap-2">
              <PopoverTrigger asChild>
                  <Button
                  ref={ref}
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  >
                  <span className="truncate">
                      {placeholder || ""}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
              </PopoverTrigger>
          </div>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
               <Input 
                  placeholder="Rechercher ou créer..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="m-1 w-[calc(100%-0.5rem)]"
              />
              <CommandList>
                  <CommandEmpty>
                      <span>Aucun résultat.</span>
                  </CommandEmpty>
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
                          value.includes(item) ? 'opacity-100' : 'opacity-0'
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

        {!singleSelection && (
          <div
            className={cn(
              'flex flex-wrap gap-1',
              dragConfig &&
                'min-h-[2.75rem] items-center rounded-md border border-dashed p-2 transition-colors',
              dragConfig &&
                (isDragOver
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-muted')
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {value.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className={cn('flex items-center gap-1', badgeClassName)}
                draggable={!!dragConfig}
                onDragStart={() => {
                  dragConfig?.onDragStart(item, dragConfig.category);
                }}
                onDragEnd={() => {
                  setIsDragOver(false);
                  dragConfig?.onDragEnd();
                }}
              >
                {item}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            {value.length === 0 && dragConfig && (
              <span className="text-xs text-muted-foreground">
                Glissez et déposez des éléments ici
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
ComboboxInput.displayName = 'ComboboxInput';

export { ComboboxInput };
