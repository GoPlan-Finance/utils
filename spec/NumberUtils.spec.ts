import { NumberUtils } from '@utils/NumberUtils';
import { processBatch, PromiseWaitAllNested, sleep } from '@utils/ProcessUtils';

describe('NumberUtils', function () {
  describe('isInt', function () {
    it('should test for integers', async () => {
      expect(NumberUtils.isInt(1)).toStrictEqual(true);
      expect(NumberUtils.isInt(-1)).toStrictEqual(true);
      expect(NumberUtils.isInt(0)).toStrictEqual(true);
      expect(NumberUtils.isInt(999999999999)).toStrictEqual(true);

      expect(NumberUtils.isInt(0.0)).toStrictEqual(true);
      expect(NumberUtils.isInt(1.0)).toStrictEqual(true);

      //@ts-expect-error edge case testing
      expect(NumberUtils.isInt('test')).toStrictEqual(false);

      expect(NumberUtils.isInt(Math.E)).toStrictEqual(false);
      expect(NumberUtils.isInt(Math.PI)).toStrictEqual(false);
      expect(NumberUtils.isInt(1.1)).toStrictEqual(false);
      expect(NumberUtils.isInt(1.1111111)).toStrictEqual(false);

      expect(NumberUtils.isInt(null)).toStrictEqual(false);
    });
  });
});
