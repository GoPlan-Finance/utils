// import { ArrayUtils } from '@utils/ArrayUtils'

import { ObjectPathUtils } from '@utils/ObjectPathUtils';

describe('ObjectPathUtils', () => {
  describe('setPathValue', () => {
    describe('string keys', () => {
      it('should set deep path value', function () {
        const data = {};

        ObjectPathUtils.setPathValue(data, 'a.b.c', true);

        expect(data).toStrictEqual({
          a: { b: { c: true } },
        });
      });

      it('should set shallow path value', function () {
        const data = {};

        ObjectPathUtils.setPathValue(data, 'a', true);

        expect(data).toStrictEqual({
          a: true,
        });
      });

      it('should only override specific value', function () {
        const data = {
          keep: true,
          a: {
            keep: true,
            b: {
              keep: true,
              c: true,
            },
          },
        };

        ObjectPathUtils.setPathValue(data, 'a.b.c', false);

        expect(data).toStrictEqual({
          keep: true,
          a: {
            keep: true,
            b: {
              keep: true,
              c: false,
            },
          },
        });
      });
    });

    describe('array keys', () => {
      it('should set deep array path value', function () {
        const data = {};

        ObjectPathUtils.setPathValue(data, ['a', 'b', 'c'], true);

        expect(data).toStrictEqual({
          a: { b: { c: true } },
        });
      });

      it('should set shallow array path value', function () {
        const data = {};

        ObjectPathUtils.setPathValue(data, ['a'], true);

        expect(data).toStrictEqual({
          a: true,
        });
      });
    });
  });

  describe('getPathValue', () => {
    describe('string keys', () => {
      it('should return a deep path value', function () {
        const data = {
          a: { b: { c: true } },
        };

        const val = ObjectPathUtils.getPathValue(data, 'a.b.c');

        expect(val).toStrictEqual(true);
      });

      it('should return a shallow path value', function () {
        const data = {
          a: true,
        };

        const val = ObjectPathUtils.getPathValue(data, 'a');

        expect(val).toStrictEqual(true);
      });

      it('should return a default, undefined value', function () {
        const data = {
          a: true,
        };

        const val = ObjectPathUtils.getPathValue(data, 'ZZZ');

        expect(val).toStrictEqual(undefined);
      });

      it('should return a default, speficied value', function () {
        const data = {
          a: true,
        };

        const val = ObjectPathUtils.getPathValue(data, 'ZZZ', 1234);

        expect(val).toStrictEqual(1234);
      });
    });

    describe('array keys', () => {
      it('should get deep path value', function () {
        const data = {
          a: { b: { c: true } },
        };

        const val = ObjectPathUtils.getPathValue(data, ['a', 'b', 'c']);

        expect(val).toStrictEqual(true);
      });

      it('should set shallow path value', function () {
        const data = {
          a: true,
        };

        const val = ObjectPathUtils.getPathValue(data, ['a']);

        expect(val).toStrictEqual(true);
      });
    });

    describe('object getters', () => {
      it('should return defaultVal when getter return undefined', function () {
        const data = {
          get a(): undefined {
            return undefined;
          },
        };

        const val = ObjectPathUtils.getPathValue(data, ['a', 'b', 'c'], 'defaultValue');
        expect(val).toStrictEqual('defaultValue');
      });

      it('should return defaultVal when getter return not an object', function () {
        const data = {
          get a(): boolean {
            return false;
          },
        };

        const val = ObjectPathUtils.getPathValue(data, ['a', 'b', 'c'], 'defaultValue');
        expect(val).toStrictEqual('defaultValue');
      });
    });
  });
});
