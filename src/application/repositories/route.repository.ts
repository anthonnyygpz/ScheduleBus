import { Route } from "@/core/entities/route.type";

export interface RouteRepository {
  findAll(): Promise<Route[]>;
}
