import { Controller, Get, Post, Patch, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/current-user.decorator';

@Controller('meals')
export class MealsController {
  constructor(private readonly meals: MealsService) {}

  @Get()
  findByDate(@Query('date') date: string, @CurrentUser() user: JwtPayload) {
    return this.meals.findByDate(user.sub, date);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const meal = await this.meals.findOne(id, user.sub);
    if (!meal) throw new NotFoundException(`Meal ${id} not found`);
    return meal;
  }

  @Post()
  create(@Body() dto: CreateMealDto, @CurrentUser() user: JwtPayload) {
    return this.meals.create(dto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMealDto>, @CurrentUser() user: JwtPayload) {
    return this.meals.update(id, dto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.meals.remove(id, user.sub);
  }
}
