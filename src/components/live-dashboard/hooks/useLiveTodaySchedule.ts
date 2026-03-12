import useSWR from "swr";
import { fetcher } from "@/core/utils/fetch";
import { ScheduleResponseDto } from "@/application/dtos/schedule.dto";

export interface LiveScheduleEntry {
  id: string;
  employeeName: string;
  employeeGroup: string;
  routeName: string;
  startTime: string;
  endTime: string;
  status: string;
  progress: number;
}

export function useLiveTodaySchedule() {
  const {
    data = [],
    isLoading,
    error,
  } = useSWR<ScheduleResponseDto[]>("/api/realtime", fetcher, {
    refreshInterval: 5000,
  });

  return { data, isLoading, error };
}

function mapToLiveEntry(dbRecord: any): LiveScheduleEntry {
  return {
    id: dbRecord.id,
    employeeName: dbRecord.employee_name || "Desconocido",
    employeeGroup: dbRecord.group_snapshot || "-",
    routeName: dbRecord.route_name || "-",
    startTime: dbRecord.start_time,
    endTime: dbRecord.end_time,
    status: dbRecord.status || "scheduled",
    progress: dbRecord.progress || 0,
  };
}
