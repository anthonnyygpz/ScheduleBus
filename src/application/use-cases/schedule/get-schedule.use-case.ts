import { ScheduleResponseDto } from "@/application/dtos/schedule.dto";
import { ScheduleRepository } from "@/application/repositories/schedule.repository";
import { ScheduleMapper } from "@/infrastructure/mappers/schedule.mapper";

export class GetScheduleUseCase {
  constructor(private scheduleRepo: ScheduleRepository) {}

  async execute(): Promise<ScheduleResponseDto | null> {
    const schedule = await this.scheduleRepo.getCurrent();

    if (!schedule) return null;

    return ScheduleMapper.toResponseDto(schedule);
  }
}
