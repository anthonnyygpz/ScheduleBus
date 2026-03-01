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

      if (!response.ok) throw new Error("Error al generar");
      await mutate("/api/schedule");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return { handleGenerate, isGenerating };
};
