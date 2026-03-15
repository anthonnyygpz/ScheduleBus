import useSWR from "swr";
import { fetcher } from "@/core/utils/fetch";
import { ScheduleEntry } from "@/core/entities/schedule.type";

export function useLiveTodaySchedule() {
  const { data, isLoading, error, mutate } = useSWR<ScheduleEntry[]>(
    "/api/realtime",
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  return {
    data: data || [],
    isLoading,
    error,
    refresh: mutate, // Permite forzar un refresco manual si es necesario
  };
}
