import { Controller, Get, Put, Body } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { UpdateGoalsDto } from './dto/update-goals.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get() get() { return this.goals.get(); }
  @Put() upsert(@Body() dto: UpdateGoalsDto) { return this.goals.upsert(dto); }
}
