import { MoneyUtils } from '@utils/MoneyUtils';
import { Money } from 'ts-money';

describe('MoneyUtils', () => {
  describe('fromAmount', () => {
    it('should build a Money instance from an integer amount', () => {
      const money = MoneyUtils.fromAmount(1234);
      expect(money).toBeInstanceOf(Money);
      expect(money?.getAmount()).toBe(1234);
    });

    it('should return null for a non-integer amount', () => {
      expect(MoneyUtils.fromAmount(12.34)).toBeNull();
    });

    it('should return null for null input', () => {
      expect(MoneyUtils.fromAmount(null)).toBeNull();
    });
  });

  describe('toAmount', () => {
    it('should return the integer amount of a Money instance', () => {
      expect(MoneyUtils.toAmount(new Money(500, 'CAD'))).toBe(500);
    });

    it('should return null for null input', () => {
      expect(MoneyUtils.toAmount(null)).toBeNull();
    });

    it('should round-trip through fromAmount', () => {
      expect(MoneyUtils.toAmount(MoneyUtils.fromAmount(777))).toBe(777);
    });
  });
});
