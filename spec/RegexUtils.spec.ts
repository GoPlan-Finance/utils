import { RegexUtils } from '@utils/RegexUtils';

describe('RegexUtils', () => {
  describe('escapeRegExp', () => {
    it('should escape all regex special characters', () => {
      expect(RegexUtils.escapeRegExp('a.b*c+?^${}()|[]\\')).toBe(
        'a\\.b\\*c\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\'
      );
    });

    it('should leave plain strings untouched', () => {
      expect(RegexUtils.escapeRegExp('hello world')).toBe('hello world');
    });

    it('should produce a pattern that matches the literal string', () => {
      const literal = 'a.c';
      const re = new RegExp(RegexUtils.escapeRegExp(literal));
      expect(re.test('a.c')).toBe(true);
      // Without escaping, '.' would match any char; ensure it does not.
      expect(re.test('abc')).toBe(false);
    });
  });

  describe('startsWith', () => {
    it('should match strings that start with the (escaped) term', () => {
      const re = RegexUtils.startsWith('a.b');
      expect(re.test('a.b-suffix')).toBe(true);
      expect(re.test('xa.b')).toBe(false);
      expect(re.test('aXb')).toBe(false);
    });
  });

  describe('contains', () => {
    it('should match strings that contain the (escaped) term anywhere', () => {
      const re = RegexUtils.contains('a.b');
      expect(re.test('prefix-a.b-suffix')).toBe(true);
      expect(re.test('prefix-aXb-suffix')).toBe(false);
    });
  });
});
