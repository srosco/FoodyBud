import { FoodsService } from './foods.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Food } from './food.entity';
import { Test } from '@nestjs/testing';
import { IsNull } from 'typeorm';

describe('FoodsService', () => {
  let service: FoodsService;
  let repo: jest.Mocked<any>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        FoodsService,
        { provide: getRepositoryToken(Food), useValue: repo },
      ],
    }).compile();
    service = module.get(FoodsService);
  });

  it('search() excludes soft-deleted foods', async () => {
    repo.find.mockResolvedValue([]);
    await service.search('test');
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.arrayContaining([
          expect.objectContaining({ deletedAt: IsNull() }),
        ]),
      }),
    );
  });

  it('softDelete() sets deletedAt', async () => {
    const food = Object.assign(new Food(), { id: '1', deletedAt: null });
    repo.findOne.mockResolvedValue(food);
    repo.save.mockImplementation((f: Food) => Promise.resolve(f));
    const result = await service.softDelete('1');
    expect(result.deletedAt).not.toBeNull();
  });
});
