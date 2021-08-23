// import { ArrayUtils } from '@utils/ArrayUtils'

import { ArrayUtils } from '@utils/ArrayUtils';
import { ObjectUtils } from '@utils/ObjectUtils';

describe('ObjectUtils', () => {
  describe('findKeyWithHighestValue', () => {
    it("should return the highest value's key", function () {
      const data = {
        a: 1,
        b: 98,
        c: 3,
        d: 99,
      };

      const val = ObjectUtils.findKeyWithHighestValue<number>(data, 2);
      expect(val).toStrictEqual(['d', 'b']);
    });
  });

  describe('intersect', () => {
    it('should return matching elements in two arrays', function () {
      expect(ArrayUtils.intersect([1, 2, 3], [3, 4, 5, 2])).toStrictEqual([2, 3]);
    });
  });

  describe('sortByValue', () => {
    const ascWay = (a: number, b: number): number => a - b;
    it('should return in asc order', () => {
      const response = ObjectUtils.sortByValue<number>({
        a: 12,
        f: 23,
        c: 1,
        e: 3,
      }, ascWay);
      expect(response[Object.keys(response)[0]]).toBe(1);
    });
  });

  describe('sortByKeys', () => {
    it('should sort keys', function () {
      const response = ObjectUtils.sortByKeys({
        d: 12,
        f: 23,
        c: 1,
        e: 3,
      });
      expect(response[Object.keys(response)[0]]).toBe(1);
    });
  });

  describe('getKeyByValue', () => {
    it('should find key', function () {
      const response = ObjectUtils.getKeyByValue({
        a: 12,
        f: 23,
        c: 1,
        e: 3,
      }, 12);
      expect(response).toBe('a');
    });
  });

  describe('deepClone', () => {
    it('should copy', function () {
      const alpha = {
        a: 23,
        b: 'hello world',
      };
      const beta = ObjectUtils.deepClone(alpha);
      expect(beta['a']).toBe(alpha['a']);
      expect(beta['b']).toBe(alpha['b']);
    });
    it('should be a new object', function () {
      const alpha = {
        a: 23,
        b: 'hello world',
      };
      const beta = ObjectUtils.deepClone(alpha);
      alpha.a = 12;
      expect(beta['a']).not.toBe(alpha['a']);
      expect(beta['b']).toBe(alpha['b']);
    });
  });
});
