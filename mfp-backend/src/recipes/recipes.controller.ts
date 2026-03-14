import { Controller, Get, Post, Patch, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  findAll() { return this.recipes.findAll(); }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const recipe = await this.recipes.findOne(id);
    if (!recipe) throw new NotFoundException(`Recipe ${id} not found`);
    return recipe;
  }

  @Post()
  create(@Body() dto: CreateRecipeDto) { return this.recipes.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRecipeDto) { return this.recipes.update(id, dto); }

  @Delete(':id')
  softDelete(@Param('id') id: string) { return this.recipes.softDelete(id); }
}
