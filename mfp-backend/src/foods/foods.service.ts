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

  async search(query?: string): Promise<Food[]> {
    if (!query) {
      return this.repo.find({ where: { deletedAt: IsNull() } });
    }

    const isNumeric = /^\d+$/.test(query);
    const conditions: object[] = [
      { name: ILike(`%${query}%`), deletedAt: IsNull() },
    ];
    if (isNumeric) {
      conditions.push({ barcode: query, deletedAt: IsNull() });
    }

    return this.repo.find({ where: conditions });
  }

  findOne(id: string): Promise<Food | null> {
    return this.repo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  create(dto: CreateFoodDto): Promise<Food> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateFoodDto): Promise<Food> {
    const food = await this.findOne(id);
    if (!food) throw new NotFoundException(`Food ${id} not found`);
    return this.repo.save({ ...food, ...dto });
  }

  async softDelete(id: string): Promise<Food> {
    const food = await this.findOne(id);  // uses IsNull() filter
    if (!food) throw new NotFoundException(`Food ${id} not found`);
    food.deletedAt = new Date();
    return this.repo.save(food);
  }
}
