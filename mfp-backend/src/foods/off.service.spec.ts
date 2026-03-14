import { OffService } from './off.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('OffService', () => {
  let service: OffService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(() => {
    httpService = { get: jest.fn() } as any;
    service = new OffService(httpService);
  });

  it('should return normalized food data for a valid barcode', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        status: 1,
        product: {
          product_name: 'Yaourt nature',
          nutriments: {
            'energy-kcal_100g': 250,
            proteins_100g: 4.5,
            carbohydrates_100g: 5.2,
            fat_100g: 3.1,
            fiber_100g: 0,
            sugars_100g: 5.2,
            'saturated-fat_100g': 2,
            salt_100g: 0.1,
          },
        },
      },
    } as any;
    httpService.get.mockReturnValue(of(mockResponse));

    const result = await service.lookup('3033490004822');

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Yaourt nature');
    expect(result!.calories).toBe(250);
    expect(result!.proteins).toBe(4.5);
  });

  it('should return null when product not found', async () => {
    const mockResponse: AxiosResponse = {
      data: { status: 0 },
    } as any;
    httpService.get.mockReturnValue(of(mockResponse));

    const result = await service.lookup('0000000000000');
    expect(result).toBeNull();
  });
});
