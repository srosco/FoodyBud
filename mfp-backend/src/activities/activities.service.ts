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

  findByDate(date: string): Promise<Activity[]> {
    return this.repo.find({ where: { date } });
  }

  findOne(id: string): Promise<Activity | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateActivityDto): Promise<Activity> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return this.repo.save({ ...activity, ...dto });
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    await this.repo.remove(activity);
  }
}
