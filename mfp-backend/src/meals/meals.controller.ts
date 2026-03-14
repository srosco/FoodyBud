import { Controller, Get, Post, Patch, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';

@Controller('meals')
export class MealsController {
  constructor(private readonly meals: MealsService) {}

  @Get()
  findByDate(@Query('date') date: string) { return this.meals.findByDate(date); }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const meal = await this.meals.findOne(id);
    if (!meal) throw new NotFoundException(`Meal ${id} not found`);
    return meal;
  }

  @Post()
  create(@Body() dto: CreateMealDto) { return this.meals.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMealDto>) { return this.meals.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.meals.remove(id); }
}
