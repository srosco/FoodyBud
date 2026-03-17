import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { UpdateGoalsDto } from './dto/update-goals.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal) private readonly repo: Repository<Goal>,
  ) {}

  async get(userId: string): Promise<Goal> {
    let goal = await this.repo.findOne({ where: { userId } });
    if (!goal) {
      goal = this.repo.create({ userId });
      await this.repo.save(goal);
    }
    return goal;
  }

  async upsert(userId: string, dto: UpdateGoalsDto): Promise<Goal> {
    const goal = await this.get(userId);
    return this.repo.save({ ...goal, ...dto });
  }
}
