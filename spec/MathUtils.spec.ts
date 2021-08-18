import { MathUtils } from '@utils/MathUtils';

describe('MathUtils', () => {
  describe('between', () => {
    it('should return max', () => {
      const min = 20,
        max = 45,
        i = 46;
      const n = MathUtils.between(i, min, max);
      expect(n).toBe(max);
    });
    it('should return min', () => {
      const min = 40,
        max = 45,
        i = 23;
      const n = MathUtils.between(i, min, max);
      expect(n).toBe(min);
    });
    it('should return i', () => {
      const min = 40,
        max = 45,
        i = 44;
      const n = MathUtils.between(i, min, max);
      expect(n).toBe(i);
    });
  });

  describe('isBetweenInclusive', () => {
    it('should work to limits', () => {
      const min = 40,
        max = 45,
        i = 45;
      const value = MathUtils.isBetweenInclusive(i, min, max);
      expect(value).toBe(true);
    });
  });

  describe('randomNumber', () => {
    it('should give a random int', () => {
      const min = 12,
        max = 23;
      const found = MathUtils.randomNumber(min, max);
      const value = found % 1 === 0;
      expect(value).toBe(true);
    });
    it('should be between min and max', () => {
      const min = 12,
        max = 23;
      const found = MathUtils.randomNumber(min, max);
      const value = found >= min && found <= max;
      expect(value).toBe(true);
    });
  });
});
