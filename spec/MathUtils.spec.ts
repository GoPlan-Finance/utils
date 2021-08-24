import { MathUtils } from '@utils/MathUtils';

describe('MathUtils', () => {
  describe('between', () => {
    it('should return max', () => {
      const n = MathUtils.between(46, 20, 45);
      expect(n).toBe(45);
    });
    it('should return min', () => {
      const n = MathUtils.between(23, 40, 45);
      expect(n).toBe(40);
    });
    it('should return i', () => {
      const n = MathUtils.between(44, 40, 45);
      expect(n).toBe(44);
    });
  });

  describe('isBetweenInclusive', () => {
    it('should work to limits', () => {
      const value = MathUtils.isBetweenInclusive(45, 40, 45);
      expect(value).toBe(true);
    });
  });

  describe('randomNumber', () => {
    it('should give a random int', () => {
      const found = MathUtils.randomNumber(12, 23);
      const value = found % 1 === 0;
      expect(value).toBe(true);
    });
    it('should be between min and max', () => {
      const found = MathUtils.randomNumber(12, 23);
      const value = found >= 12 && found <= 23;
      expect(value).toBe(true);
    });
  });
});
