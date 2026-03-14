import { Activity } from './activity.entity';

describe('Activity entity', () => {
  it('should have required fields', () => {
    const activity = new Activity();
    activity.name = 'Running';
    activity.date = '2024-01-15';
    activity.caloriesBurned = 300;
    expect(activity.name).toBe('Running');
    expect(activity.caloriesBurned).toBe(300);
  });
});
