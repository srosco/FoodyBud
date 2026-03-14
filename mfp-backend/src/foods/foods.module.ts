import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Food } from './food.entity';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { OffService } from './off.service';

@Module({
  imports: [TypeOrmModule.forFeature([Food]), HttpModule],
  controllers: [FoodsController],
  providers: [FoodsService, OffService],
  exports: [FoodsService],
})
export class FoodsModule {}
