import { RouteResponseDto } from "@/application/use-cases/get-routes/get-routes.dto";
import { fetcher } from "@/core/utils/fetch";
import useSWR from "swr";

export const useRoutes = () => {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<RouteResponseDto[]>("/api/routes", fetcher);

  const routeOptions = data.map((ruta) => ({
    value: ruta.id.toString(),
    label: ruta.name,
  }));

  return { data, routeOptions, error, isLoading };
};
