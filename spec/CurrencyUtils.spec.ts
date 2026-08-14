import { CurrencyUtils } from '@utils/CurrencyUtils';

describe('CurrencyUtils', () => {
  describe('getCurrencyInfo', () => {
    it('should return the default info when currency is null', () => {
      expect(CurrencyUtils.getCurrencyInfo(null)).toStrictEqual({
        decimal_digits: 2,
        symbol: '$',
      });
    });

    it('should return info for a known currency (case-insensitive)', () => {
      const info = CurrencyUtils.getCurrencyInfo('usd');
      expect(info.symbol).toBe('$');
      expect(typeof info.decimal_digits).toBe('number');
    });

    it('should throw for an unknown currency', () => {
      let thrown: unknown;
      try {
        CurrencyUtils.getCurrencyInfo('NOPE');
      } catch (e) {
        thrown = e;
      }
      expect(String(thrown)).toContain('Currency not found');
    });
  });

  describe('formatCurrency', () => {
    it('should format with two decimals by default (fixedDecimals)', () => {
      expect(CurrencyUtils.formatCurrency(1234.5, 'USD', true, 'en-US', undefined)).toBe(
        '$1,234.50'
      );
    });

    it('should drop trailing decimals when fixedDecimals is false', () => {
      expect(CurrencyUtils.formatCurrency(1000, 'USD', false, 'en-US', undefined)).toBe('$1,000');
    });

    it('should return an empty string for null/undefined values', () => {
      expect(CurrencyUtils.formatCurrency(null, 'USD', true, 'en-US', undefined)).toBe('');
      expect(CurrencyUtils.formatCurrency(undefined, 'USD', true, 'en-US', undefined)).toBe('');
    });
  });
});
