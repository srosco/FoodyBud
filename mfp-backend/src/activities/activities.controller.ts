import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/current-user.decorator';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  findByDate(@Query('date') date: string, @CurrentUser() user: JwtPayload) {
    return this.activities.findByDate(user.sub, date);
  }

  @Post()
  create(@Body() dto: CreateActivityDto, @CurrentUser() user: JwtPayload) {
    return this.activities.create(dto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto, @CurrentUser() user: JwtPayload) {
    return this.activities.update(id, dto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.activities.remove(id, user.sub);
  }
}
