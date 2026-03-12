"use client";

import * as React from "react";
import { cn } from "@/core/utils/tw";

export interface InputProps extends React.ComponentProps<"input"> {
  helperText?: string;
  error?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      helperText,
      error,
      id,
      startAdornment,
      endAdornment,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper-text`;

    return (
      <div className="group/input w-full space-y-1.5">
        <div
          className={cn(
            "flex items-center h-9 w-full rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow]",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            error &&
              "border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40",
            className,
          )}
        >
          {startAdornment && (
            <div className="flex items-center pl-3 text-muted-foreground">
              {startAdornment}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={error}
            aria-describedby={helperText ? helperId : undefined}
            className={cn(
              "flex-1 bg-transparent px-3 py-1 text-base outline-none md:text-sm placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              // Ajustamos el padding dinámicamente si hay adornos para que no quede muy separado
              startAdornment && "pl-2",
              endAdornment && "pr-2",
            )}
            {...props}
          />

          {endAdornment && (
            <div className="flex items-center pr-3 text-muted-foreground">
              {endAdornment}
            </div>
          )}
        </div>

        {helperText && (
          <p
            id={helperId}
            className={cn(
              "text-xs leading-none transition-colors",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
