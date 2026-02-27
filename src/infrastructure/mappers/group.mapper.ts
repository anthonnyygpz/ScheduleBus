import { GroupResponseDto } from "@/application/dtos/group.dto";
import { Group } from "@/core/entities/group.type";

export class GroupMapper {
  static toMap(group: any): Group {
    return new Group(group.id, group.name, group.hours, group.color);
  }

  static toResponseDto(group: Group): GroupResponseDto {
    return new GroupResponseDto({
      id: group.id,
      name: group.name,
      hours: group.hours,
      color: group.color,
    });
  }
}
