import { ScheduleResponseDto } from "@/application/dtos/schedule.dto";
import { fetcher } from "@/core/utils/fetch";
import useSWR from "swr";

export const useSchedule = () => {
  const { data, error, isLoading } = useSWR<ScheduleResponseDto>(
    "/api/schedule",
    fetcher,
  );

  return { data, error, isLoading };
};
