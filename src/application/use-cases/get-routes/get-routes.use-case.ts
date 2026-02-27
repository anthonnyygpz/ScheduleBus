import { RouteRepository } from "@/application/repositories/route.repository";
import { RouteResponseDto } from "./get-routes.dto";

export class GetRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(): Promise<RouteResponseDto[]> {
    const routes = await this.routeRepository.findAll();

    return routes.map((route) => ({
      id: route.id,
      name: route.name,
      createdAt: route.created_at,
    }));
  }
}
