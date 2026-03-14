import { Controller, Get, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summary: SummaryService) {}

  @Get()
  get(@Query('date') date: string) {
    return this.summary.getSummary(date ?? new Date().toISOString().split('T')[0]);
  }
}
