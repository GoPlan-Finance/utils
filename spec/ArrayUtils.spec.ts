import { ArrayUtils } from '@utils/ArrayUtils';

describe('ArrayUtils', () => {
  describe('fillWith', () => {
    it('should call initializer on every items', function () {
      let i = 1;
      const initializer = () => i++;

      const val = ArrayUtils.fillWith(4, initializer);
      expect(val).toStrictEqual([1, 2, 3, 4]);
    });

    it('should pass the index to the initializer', function () {
      const val = ArrayUtils.fillWith(3, index => index * 2);
      expect(val).toStrictEqual([0, 2, 4]);
    });

    it('should return an empty array for length 0', function () {
      expect(ArrayUtils.fillWith(0, () => 1)).toStrictEqual([]);
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

  describe('toKeyValueArray', () => {
    it('should return matching elements grouped by keys', function () {
      const data = [
        { color: 'blue', n: 1 },
        { color: 'blue', n: 2 },
        { color: 'red', n: 3 },
        { color: 'red', n: 4 },
        { color: 'yellow', n: 5 },
      ];

      const result = ArrayUtils.toKeyValueArray(
        data,
        item => item.color,
        item => item
      );
      expect(result).toMatchSnapshot();

      const result2 = ArrayUtils.toKeyValueArray(data, 'color', 'n');
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
    let randomSpy: jest.SpyInstance;

    afterEach(() => {
      randomSpy?.mockRestore();
    });

    const mockRandom = (val: number) => {
      randomSpy = jest.spyOn(Math, 'random').mockReturnValue(val);
    };

    it('should map Math.random() across the full index range', () => {
      const arr = Array.from(Array(100).keys());

      mockRandom(0);
      expect(ArrayUtils.randomElement(arr)).toBe(0);

      mockRandom(0.5);
      expect(ArrayUtils.randomElement(arr)).toBe(50);
    });

    it('should be able to return the LAST element (regression: off-by-one)', () => {
      // Math.random() returns [0, 1); a value just below 1 must select the final index.
      mockRandom(0.999999);
      expect(ArrayUtils.randomElement([10, 20, 30])).toBe(30);

      // A two-element array must be able to yield its second element.
      mockRandom(0.5);
      expect(ArrayUtils.randomElement([1, 2])).toBe(2);
    });

    it('should throw when provided array is empty', () => {
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

    it('should return null when the array is empty', () => {
      const output = ArrayUtils.filterByValue(
        [],
        (a, b) => a > b,
        elem => elem
      );

      expect(output).toBeNull();
    });
  });

  describe('shuffle', () => {
    it('should keep the same elements (as a multiset)', () => {
      const input = [1, 2, 3, 4, 5];
      const result = ArrayUtils.shuffle([...input]);

      expect(result).toHaveLength(input.length);
      expect([...result].sort((a, b) => a - b)).toStrictEqual(input);
    });
  });

  describe('uniqueByKey', () => {
    it('should keep the first item for each distinct key value', () => {
      const data = [
        { id: 1, name: 'a' },
        { id: 1, name: 'b' },
        { id: 2, name: 'c' },
      ];

      expect(ArrayUtils.uniqueByKey(data, 'id')).toStrictEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'c' },
      ]);
    });
  });

  describe('sortByKey', () => {
    const data = () => [{ v: 3 }, { v: 1 }, { v: 2 }];

    it('should sort ascending by default', () => {
      expect(ArrayUtils.sortByKey(data(), 'v')).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });

    it('should sort descending when ascending is false', () => {
      expect(ArrayUtils.sortByKey(data(), 'v', false)).toStrictEqual([
        { v: 3 },
        { v: 2 },
        { v: 1 },
      ]);
    });
  });

  describe('toKeyArray', () => {
    it('should index objects by the given key', () => {
      const data = [
        { id: 'a', n: 1 },
        { id: 'b', n: 2 },
      ];

      expect(ArrayUtils.toKeyArray(data, 'id')).toStrictEqual({
        a: { id: 'a', n: 1 },
        b: { id: 'b', n: 2 },
      });
    });
  });

  describe('sum', () => {
    it('should sum the values produced by the callback', () => {
      expect(ArrayUtils.sum([{ n: 1 }, { n: 2 }, { n: 3 }], item => item.n)).toBe(6);
    });

    it('should return 0 for an empty array', () => {
      expect(ArrayUtils.sum([], (item: { n: number }) => item.n)).toBe(0);
    });
  });
});
