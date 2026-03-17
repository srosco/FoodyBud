import { Controller, Get, Put, Body } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/current-user.decorator';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get()
  get(@CurrentUser() user: JwtPayload) {
    return this.goals.get(user.sub);
  }

  @Put()
  upsert(@CurrentUser() user: JwtPayload, @Body() dto: UpdateGoalsDto) {
    return this.goals.upsert(user.sub, dto);
  }
}
