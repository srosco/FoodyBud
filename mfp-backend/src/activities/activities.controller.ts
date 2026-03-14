import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  findByDate(@Query('date') date: string) { return this.activities.findByDate(date); }

  @Post()
  create(@Body() dto: CreateActivityDto) { return this.activities.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto) { return this.activities.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.activities.remove(id); }
}
