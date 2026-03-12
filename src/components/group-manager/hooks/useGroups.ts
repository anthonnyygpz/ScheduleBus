import { useMemo } from "react";
import { GroupResponseDto } from "@/application/dtos/group.dto";
import { fetcher } from "@/core/utils/fetch";
import useSWR from "swr";

export const useGroups = () => {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<GroupResponseDto[]>("/api/groups", fetcher);

  const groupOptions = useMemo(
    () =>
      data.map((group) => ({
        value: group.id.toString(),
        label: group.name,
      })),
    [data],
  );

  return {
    data,
    groupOptions,
    error,
    isLoading,
  };
};
