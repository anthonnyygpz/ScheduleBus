import { GroupResponseDto } from "@/application/dtos/group.dto";
import { GroupRepository } from "@/application/repositories/group.repository";
import { GroupMapper } from "@/infrastructure/mappers/group.mapper";

export class GetGroupsUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(): Promise<GroupResponseDto[]> {
    const groups = await this.groupRepository.findAll();
    return groups.map((group) => GroupMapper.toResponseDto(group));
  }
}
