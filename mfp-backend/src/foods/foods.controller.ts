import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, NotFoundException,
} from '@nestjs/common';
import { FoodsService } from './foods.service';
import { OffService } from './off.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/current-user.decorator';

@Controller('foods')
export class FoodsController {
  constructor(
    private readonly foods: FoodsService,
    private readonly off: OffService,
  ) {}

  @Get()
  search(@Query('search') query: string, @CurrentUser() user: JwtPayload) {
    return this.foods.search(user.sub, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const food = await this.foods.findOne(id, user.sub);
    if (!food) throw new NotFoundException(`Food ${id} not found`);
    return food;
  }

  @Post('scan')
  scan(@Body() dto: ScanBarcodeDto) {
    return this.off.lookup(dto.barcode);
  }

  @Post()
  create(@Body() dto: CreateFoodDto, @CurrentUser() user: JwtPayload) {
    return this.foods.create(dto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFoodDto, @CurrentUser() user: JwtPayload) {
    return this.foods.update(id, dto, user.sub);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.foods.softDelete(id, user.sub);
  }
}
