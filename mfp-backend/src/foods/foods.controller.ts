import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, NotFoundException,
} from '@nestjs/common';
import { FoodsService } from './foods.service';
import { OffService } from './off.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';

@Controller('foods')
export class FoodsController {
  constructor(
    private readonly foods: FoodsService,
    private readonly off: OffService,
  ) {}

  @Get()
  search(@Query('search') query?: string) {
    return this.foods.search(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const food = await this.foods.findOne(id);
    if (!food) throw new NotFoundException(`Food ${id} not found`);
    return food;
  }

  @Post('scan')
  scan(@Body() dto: ScanBarcodeDto) {
    return this.off.lookup(dto.barcode);
  }

  @Post()
  create(@Body() dto: CreateFoodDto) {
    return this.foods.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFoodDto) {
    return this.foods.update(id, dto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.foods.softDelete(id);
  }
}
