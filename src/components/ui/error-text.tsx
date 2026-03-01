"use client";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  children: React.ReactNode;
}
const ErrorText: React.FC<Props> = ({ className, children }) => {
  return (
    <div className={cn("py-20 text-center text-muted-foreground", className)}>
      {children}
    </div>
  );
};

export default ErrorText;
