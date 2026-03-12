import { useMemo } from "react";
import { RouteResponseDto } from "@/application/use-cases/get-routes/get-routes.dto";
import { fetcher } from "@/core/utils/fetch";
import useSWR from "swr";

export const useRoutes = () => {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<RouteResponseDto[]>("/api/routes", fetcher);

  const routeOptions = useMemo(
    () =>
      data.map((ruta) => ({
        value: ruta.id.toString(),
        label: ruta.name,
      })),
    [data],
  );

  return { data, routeOptions, error, isLoading };
};
