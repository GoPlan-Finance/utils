import { MathUtils } from '@utils/MathUtils';

describe('MathUtils', () => {
  let n : number;
  let i : number;
  let min:number;
  let max : number;

  describe('between', () => {
    it('should return max',()=>{
      min = 20;
      max = 45;
      i = 46;
      n = MathUtils.between(i,min,max);
      expect(n).toBe(max);
    })
    it('should return min',()=>{
      min = 40;
      max = 45;
      i = 23;
      n = MathUtils.between(i,min,max);
      expect(n).toBe(min);
    })
    it('should return i',()=>{
      min = 40;
      max = 45;
      i = 44;
      n = MathUtils.between(i,min,max);
      expect(n).toBe(i);
    })
  })

  describe('isBetweenInclusive', () => {
    it('should work to limits',() => {
      min = 40;
      max = 45;
      i = 45;
      const value = MathUtils.isBetweenInclusive(i, min, max);
      expect(value).toBe(true);
    })
  })

  describe('randomNumber', () => {
    it('should give a random int', ()=>{
      min = 12;
      max = 23;
      const found = MathUtils.randomNumber(min, max);
      const value = found % 1 === 0;
      expect(value).toBe(true);
    })
    it('should be between min and max', ()=>{
      min = 12;
      max = 23;
      const found = MathUtils.randomNumber(min, max);
      const value = (found >= min && found <= max)
      expect(value).toBe(true);
    })
  })
})