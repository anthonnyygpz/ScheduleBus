import { GroupResponseDto } from "@/application/dtos/group.dto";
import { fetcher } from "@/core/utils/fetch";
import useSWR from "swr";

export const useGroups = () => {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<GroupResponseDto[]>("/api/groups", fetcher);

  const groupOptions = data.map((group) => ({
    value: group.id.toString(),
    label: group.name,
  }));

  return {
    data,
    groupOptions,
    error,
    isLoading,
  };
};
