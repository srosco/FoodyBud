import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity) private readonly repo: Repository<Activity>,
  ) {}

  findByDate(userId: string, date: string): Promise<Activity[]> {
    return this.repo.find({ where: { date, userId } });
  }

  findOne(id: string, userId: string): Promise<Activity | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  create(dto: CreateActivityDto, userId: string): Promise<Activity> {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  async update(id: string, dto: UpdateActivityDto, userId: string): Promise<Activity> {
    const activity = await this.findOne(id, userId);
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return this.repo.save({ ...activity, ...dto });
  }

  async remove(id: string, userId: string): Promise<void> {
    const activity = await this.findOne(id, userId);
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    await this.repo.remove(activity);
  }
}
