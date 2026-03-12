import { useState } from "react";
import { getTuesday } from "./useScheduleDerivedData";
import { mutate } from "swr";

export const useGenerateSchedule = (weekOffset: number) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const tuesday = getTuesday(new Date());
      tuesday.setDate(tuesday.getDate() + weekOffset * 7);

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { weekStart: tuesday.toISOString() },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Error HTTP al generar el horario",
        );
      }

      await mutate("/api/schedule");
    } catch (err: any) {
      console.error("[useGenerateSchedule Error]:", err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return { handleGenerate, isGenerating };
};
