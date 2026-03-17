import { Controller, Get, Post, Patch, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/current-user.decorator';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) { return this.recipes.findAll(user.sub); }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const recipe = await this.recipes.findOne(id, user.sub);
    if (!recipe) throw new NotFoundException(`Recipe ${id} not found`);
    return recipe;
  }

  @Post()
  create(@Body() dto: CreateRecipeDto, @CurrentUser() user: JwtPayload) { return this.recipes.create(dto, user.sub); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRecipeDto, @CurrentUser() user: JwtPayload) { return this.recipes.update(id, dto, user.sub); }

  @Delete(':id')
  softDelete(@Param('id') id: string, @CurrentUser() user: JwtPayload) { return this.recipes.softDelete(id, user.sub); }
}
