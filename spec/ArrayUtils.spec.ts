import { ArrayUtils } from '@utils/ArrayUtils';

describe('ArrayUtils', () => {
  describe('fillWith', () => {
    it('should call initializer on every items', function () {
      let i = 1;
      const initializer = () => i++;

      const val = ArrayUtils.fillWith(4, initializer);
      expect(val).toStrictEqual([1, 2, 3, 4]);
    });

    it('should remove duplicate items', function () {
      const data = [1, 2, 3, 4, 4, 4];

      const val = ArrayUtils.unique(data);
      expect(val).toStrictEqual([1, 2, 3, 4]);
    });
  });

  describe('unique', () => {
    it('should return all non unique items', function () {
      const data = [1, 2, 3, 4];

      const val = ArrayUtils.unique(data);
      expect(val).toStrictEqual([1, 2, 3, 4]);
    });

    it('should remove duplicate items', function () {
      const data = [1, 2, 3, 4, 4, 4];

      const val = ArrayUtils.unique(data);
      expect(val).toStrictEqual([1, 2, 3, 4]);
    });
  });

  describe('moveIndex', () => {
    it('should return original object if index not found', function () {
      const val = ArrayUtils.moveIndex([1, 2, 3, 4], 0, a => false);
      expect(val).toStrictEqual([1, 2, 3, 4]);
    });

    it('should move the first to the desired position', function () {
      const val = ArrayUtils.moveIndex([1, 2, 3, 4], 0, a => a === 1);
      expect(val).toStrictEqual([1, 2, 3, 4]);

      const val2 = ArrayUtils.moveIndex([1, 2, 3, 4], 1, a => a === 1);
      expect(val2).toStrictEqual([2, 1, 3, 4]);

      const val3 = ArrayUtils.moveIndex([1, 2, 3, 4], 2, a => a === 1);
      expect(val3).toStrictEqual([2, 3, 1, 4]);

      const val4 = ArrayUtils.moveIndex([1, 2, 3, 4], 3, a => a === 1);
      expect(val4).toStrictEqual([2, 3, 4, 1]);
    });

    it('should move the last to the desired position', function () {
      const val = ArrayUtils.moveIndex([1, 2, 3, 4], 3, a => a === 4);
      expect(val).toStrictEqual([1, 2, 3, 4]);

      const val2 = ArrayUtils.moveIndex([1, 2, 3, 4], 2, a => a === 4);
      expect(val2).toStrictEqual([1, 2, 4, 3]);

      const val3 = ArrayUtils.moveIndex([1, 2, 3, 4], 1, a => a === 4);
      expect(val3).toStrictEqual([1, 4, 2, 3]);

      const val4 = ArrayUtils.moveIndex([1, 2, 3, 4], 0, a => a === 4);
      expect(val4).toStrictEqual([4, 1, 2, 3]);
    });

    it('should move the middle element to the desired position', function () {
      const val = ArrayUtils.moveIndex([1, 2, 3], 1, a => a === 2);
      expect(val).toStrictEqual([1, 2, 3]);

      const val2 = ArrayUtils.moveIndex([1, 2, 3], 0, a => a === 2);
      expect(val2).toStrictEqual([2, 1, 3]);

      const val3 = ArrayUtils.moveIndex([1, 2, 3], 2, a => a === 2);
      expect(val3).toStrictEqual([1, 3, 2]);
    });
  });

  describe('intersect', () => {
    it('should return matching elements in two arrays', function () {
      expect(ArrayUtils.intersect([1, 2, 3], [3, 4, 5, 2])).toStrictEqual([2, 3]);
    });

    it('intersect should return nothing if one of the array is empty', function () {
      expect(ArrayUtils.intersect([1, 2, 3], [])).toStrictEqual([]);
      expect(ArrayUtils.intersect([], [1, 2, 3])).toStrictEqual([]);
    });
  });

  describe('groupBy', () => {
    it('should return matching elements grouped by sub-keys', function () {
      const data = [
        { color: 'blue', n: 1 },
        { color: 'blue', n: 2 },
        { color: 'red', n: 3 },
        { color: 'red', n: 4 },
        { color: 'yellow', n: 5 },
      ];

      const result = ArrayUtils.groupBy(data, item => item.color);
      expect(result).toMatchSnapshot();

      const result2 = ArrayUtils.groupBy(data, item => (item.n % 2 ? 'odd' : 'even'));
      expect(result2).toMatchSnapshot();
    });
  });

  describe('batches', () => {
    it('should return matching elements grouped by batch number', function () {
      const arr = Array.from(Array(100).keys());

      expect(ArrayUtils.batches(arr, 10)).toMatchSnapshot();

      expect(ArrayUtils.batches(arr, 200)).toMatchSnapshot();

      expect(ArrayUtils.batches([], 200)).toMatchSnapshot();
    });

    it('should return a single batch when perChunk is bigger than len', function () {
      const arr = Array.from(Array(100).keys());
      expect(ArrayUtils.batches(arr, 200)).toMatchSnapshot();
    });

    it('should return an empty array when no data is given', function () {
      expect(ArrayUtils.batches([], 200)).toMatchSnapshot();
    });
  });

  describe('randomElement', () => {
    it('should return one of the array element randomly', () => {
      const setMock = (val: number) => {
        const mockMath = Object.create(global.Math);
        mockMath.random = () => val;
        global.Math = mockMath;
      };

      const arr = Array.from(Array(100).keys());

      setMock(0);
      expect(ArrayUtils.randomElement(arr)).toBe(0);

      setMock(0.01);
      expect(ArrayUtils.randomElement(arr)).toBe(0);

      setMock(0.5);
      expect(ArrayUtils.randomElement(arr)).toBe(49);

      setMock(1);
      expect(ArrayUtils.randomElement(arr)).toBe(99);
    });

    it('should return one of the array element randomly', () => {
      const setMock = (val: number) => {
        const mockMath = Object.create(global.Math);
        mockMath.random = () => val;
        global.Math = mockMath;
      };

      const arr = Array.from(Array(100).keys());

      setMock(0);
      expect(ArrayUtils.randomElement(arr)).toBe(0);

      setMock(0.01);
      expect(ArrayUtils.randomElement(arr)).toBe(0);

      setMock(0.5);
      expect(ArrayUtils.randomElement(arr)).toBe(49);

      setMock(1);
      expect(ArrayUtils.randomElement(arr)).toBe(99);
    });

    it('should throw when provided array is empty', () => {
      const arr = Array.from(Array(100).keys());

      expect(() => ArrayUtils.randomElement([])).toThrowError('provided array is empty');
    });
  });

  describe('filterByvalue', () => {
    it('should return the filter element and value', () => {
      const output = ArrayUtils.filterByValue(
        [1, 5, 10],
        (a, b) => a > b,
        elem => elem * 10 + 1
      );

      expect(output).toStrictEqual({
        key: '2',
        elem: 10,
        value: 101,
      });
    });

    it('should throw when provided array is empty', () => {
      const arr = Array.from(Array(100).keys());

      expect(() => ArrayUtils.randomElement([])).toThrowError('provided array is empty');
    });
  });
});
