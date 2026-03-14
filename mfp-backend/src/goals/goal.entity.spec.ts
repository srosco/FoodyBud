import { Goal } from './goal.entity';

describe('Goal entity', () => {
  it('should have nutritional goal fields with defaults', () => {
    const goal = new Goal();
    goal.calories = 2000;
    goal.proteins = 150;
    goal.carbs = 250;
    goal.fat = 65;
    expect(goal.calories).toBe(2000);
    expect(goal.proteins).toBe(150);
  });
});
