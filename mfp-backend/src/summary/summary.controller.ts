import { Controller, Get, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/current-user.decorator';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summary: SummaryService) {}

  @Get()
  get(@CurrentUser() user: JwtPayload, @Query('date') date: string) {
    return this.summary.getSummary(user.sub, date ?? new Date().toISOString().split('T')[0]);
  }
}
