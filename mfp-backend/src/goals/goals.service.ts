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

  async get(): Promise<Goal> {
    let goal = await this.repo.findOne({ where: { singleton: true } });
    if (!goal) {
      goal = this.repo.create({ singleton: true });
      await this.repo.save(goal);
    }
    return goal;
  }

  async upsert(dto: UpdateGoalsDto): Promise<Goal> {
    const goal = await this.get();
    return this.repo.save({ ...goal, ...dto });
  }
}
