import { StringUtils } from '@utils/StringUtils';

describe('StringUtils', () => {
  describe('properCase', () => {
    it('should return a formatted Proper Case Sentence', function () {
      const val = StringUtils.properCase('this is a sentence');
      expect(val).toStrictEqual('This Is A Sentence');

      const val2 = StringUtils.properCase('this-is-a-sentence with some dashes');
      expect(val2).toStrictEqual('This-Is-A-Sentence With Some Dashes');
    });

    it('should handle empty strings and invalid inputs', function () {
      const val = StringUtils.properCase('');
      expect(val).toStrictEqual('');

      const val2 = StringUtils.properCase(null);
      expect(val2).toStrictEqual(null);

      const val3 = StringUtils.properCase(undefined);
      expect(val3).toStrictEqual(undefined);
    });

    it('should leave non-alpha chars untoutched', function () {
      const val = StringUtils.properCase('!@#$@%^#^%& abc *$^&(* $!@#%$ !^%!$#^ !#$^{}{|}?> dEF');
      expect(val).toStrictEqual('!@#$@%^#^%& Abc *$^&(* $!@#%$ !^%!$#^ !#$^{}{|}?> Def');

      const val2 = StringUtils.properCase(
        'abc                                  def                      '
      );
      expect(val2).toStrictEqual('Abc                                  Def                      ');
    });
  }); // properCase

  describe('toFloatOrNull', () => {
    it('should return null', function () {
      const response = StringUtils.toFloatOrNull('');
      expect(response).toStrictEqual(null);
    });
    it('should return 1', function () {
      const response = StringUtils.toFloatOrNull('1.00');
      expect(response).toStrictEqual(1);
    });
    it('should return 3.14', function () {
      const response = StringUtils.toFloatOrNull('3.14');
      expect(response).toStrictEqual(3.14);
    });
  });
  describe('toFixedOrNull', () => {
    it('should return null', function () {
      const response = StringUtils.toFixedOrNull('');
      expect(response).toStrictEqual(null);
    });
    it('should return 1', function () {
      const response = StringUtils.toFixedOrNull('1.00');
      expect(response).toStrictEqual(1);
    });
    it('should return 3', function () {
      const response = StringUtils.toFixedOrNull('3');
      expect(response).toStrictEqual(3);
    });
  });

  describe('hideZero', () => {
    it('should return 1000', function () {
      const response = StringUtils.hideZero(1000);
      expect(response).toStrictEqual('1000');
    });
    it('should return nothing', function () {
      const response = StringUtils.hideZero(0);
      expect(response).toStrictEqual('');
    });
  });

  describe('localeCompare', () => {
    it('should not be equal', function () {
      const response = StringUtils.localeCompare('hello', 'world', 'base');
      expect(response).toStrictEqual(false);
    });
    it('should be equal', function () {
      const response = StringUtils.localeCompare('hello', 'hello', 'base');
      expect(response).toStrictEqual(true);
    });
    it('should be comparing accent', function () {
      const response = StringUtils.localeCompare('hee', 'hée', 'accent');
      expect(response).toStrictEqual(false);
    });
  });
  describe('trimOrNull', () => {
    it('should return null', function () {
      const response = StringUtils.trimOrNull(null);
      expect(response).toStrictEqual(null);
    });
    it('should trim', function () {
      const response = StringUtils.trimOrNull('  test ');
      expect(response).toStrictEqual('test');
    });
  });
});
