"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { value: string; label: string; email?: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((val) => (
                <Badge key={val} variant="secondary">
                  {options.find((o) => o.value === val)?.label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput
            placeholder="Buscar empleado o correo..."
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label + " " + (option.email || "")}
                  onSelect={() => toggleOption(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.email && (
                      <span className="text-xs text-muted-foreground">
                        {option.email}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
