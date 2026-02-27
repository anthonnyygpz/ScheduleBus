import { Group } from "@/core/entities/group.type";

export interface GroupRepository {
  findAll(): Promise<Group[]>;
}
