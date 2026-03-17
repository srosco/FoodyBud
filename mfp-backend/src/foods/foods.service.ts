import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { Food } from './food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private readonly repo: Repository<Food>,
  ) {}

  async search(userId: string, query?: string): Promise<Food[]> {
    if (!query) {
      return this.repo.find({ where: { deletedAt: IsNull(), userId } });
    }

    const isNumeric = /^\d+$/.test(query);
    const conditions: object[] = [
      { name: ILike(`%${query}%`), deletedAt: IsNull(), userId },
    ];
    if (isNumeric) {
      conditions.push({ barcode: query, deletedAt: IsNull(), userId });
    }

    return this.repo.find({ where: conditions });
  }

  findOne(id: string, userId: string): Promise<Food | null> {
    return this.repo.findOne({ where: { id, deletedAt: IsNull(), userId } });
  }

  create(dto: CreateFoodDto, userId: string): Promise<Food> {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  async update(id: string, dto: UpdateFoodDto, userId: string): Promise<Food> {
    const food = await this.findOne(id, userId);
    if (!food) throw new NotFoundException(`Food ${id} not found`);
    return this.repo.save({ ...food, ...dto });
  }

  async softDelete(id: string, userId: string): Promise<Food> {
    const food = await this.findOne(id, userId);
    if (!food) throw new NotFoundException(`Food ${id} not found`);
    food.deletedAt = new Date();
    return this.repo.save(food);
  }
}
