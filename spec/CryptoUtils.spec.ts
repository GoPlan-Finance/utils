import Crypto from '@utils/CryptoUtils';

describe('CryptoUtils (Crypto)', () => {
  const validEncrypted = {
    ct: 'cipher',
    iv: 'iv',
    kVer: 1,
    aVer: 2,
  };

  describe('isEncrypted', () => {
    it('should return true for a well-formed encrypted value', () => {
      expect(Crypto.isEncrypted({ ...validEncrypted })).toBe(true);
    });

    it('should return false when a required key is missing', () => {
      const { ct: _ct, ...missingCt } = validEncrypted;
      expect(Crypto.isEncrypted(missingCt as unknown as Record<string, unknown>)).toBe(false);
    });

    it('should return false when a required key has the wrong type', () => {
      expect(Crypto.isEncrypted({ ...validEncrypted, kVer: '1' })).toBe(false);
    });

    it('should return false for non-object / null / undefined inputs', () => {
      expect(Crypto.isEncrypted(null as unknown as Record<string, unknown>)).toBe(false);
      expect(Crypto.isEncrypted(undefined as unknown as Record<string, unknown>)).toBe(false);
      expect(Crypto.isEncrypted('str' as unknown as Record<string, unknown>)).toBe(false);
    });

    describe('strict mode (default)', () => {
      it('should return false when extra keys are present', () => {
        expect(Crypto.isEncrypted({ ...validEncrypted, extra: 'nope' })).toBe(false);
      });
    });

    describe('non-strict mode', () => {
      it('should allow extra keys', () => {
        expect(Crypto.isEncrypted({ ...validEncrypted, extra: 'ok' }, false)).toBe(true);
      });
    });
  });

  describe('buffToStr / strToBuff', () => {
    it('should round-trip a byte array through base64', () => {
      const bytes = Uint8Array.from([0, 1, 2, 250, 255]);
      const b64 = Crypto.buffToStr(bytes);
      const restored = Crypto.strToBuff(b64);
      expect(Array.from(restored)).toStrictEqual(Array.from(bytes));
    });
  });
});
