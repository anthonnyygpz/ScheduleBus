import { ScheduleResponseDto } from "@/application/dtos/schedule.dto";
import { fetcher } from "@/core/utils/fetch";
import useSWR from "swr";

export const useSchedule = (weekStart?: Date) => {
  const url = weekStart
    ? `/api/schedule?weekStart=${weekStart}`
    : "/api/schedule";
  const { data, error, isLoading } = useSWR<ScheduleResponseDto>(url, fetcher);

  return { data, error, isLoading };
};
