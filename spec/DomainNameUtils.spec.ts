import { DomainNameUtils } from '@utils/DomainNameUtils';

describe('DomainNameUtils', () => {
  describe('getDomainNameRegex', () => {
    it('should return a regex to test domains', function () {
      const regex = DomainNameUtils.getDomainNameRegex();

      expect(regex.test('google.com')).toBe(true);
      expect(regex.test('test.google.com')).toBe(true);
      expect(regex.test('test.test.google.com')).toBe(true);

      expect(regex.test('google.ca')).toBe(true);
    });

    it('should return a regex to test invalid domains', function () {
      const regex = DomainNameUtils.getDomainNameRegex();

      expect(regex.test('test')).toBe(false);
      expect(regex.test('test/test.com')).toBe(false);
      expect(regex.test('google.com?test')).toBe(false);
      expect(regex.test('http://test.test.google.com')).toBe(false);

      expect(regex.test('test@google.com')).toBe(false);
    });
  });
});
