"use client";

import { SWRConfig } from "swr";
import { useToast } from "@/hooks/use-toast";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then((res) => res.json()),
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error de Sistema",
            description: error.message,
          });
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
