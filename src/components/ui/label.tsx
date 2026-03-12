"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Info } from "lucide-react";

import { cn } from "@/core/utils/tw";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LabelProps extends React.ComponentPropsWithoutRef<
  typeof LabelPrimitive.Root
> {
  required?: boolean;
  tooltip?: string;
}

function Label({
  className,
  required,
  tooltip,
  children,
  ...props
}: LabelProps) {
  return (
    <div className="flex items-center gap-1">
      <LabelPrimitive.Root
        data-slot="label"
        className={cn(
          "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </LabelPrimitive.Root>

      {tooltip && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Más información"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-50 text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export { Label };
