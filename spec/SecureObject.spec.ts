import { SecureObject } from '@utils/parse/SecureObject';

class TestSecureObject extends SecureObject {
  constructor() {
    super('TestSecureObject', ['secret']);
  }
}

describe('SecureObject', () => {
  beforeAll(() => {
    // set() on a secure field requires a session derived key to be present. The value itself is
    // only used when encrypting on save, so a stub key is enough to exercise the read/clone cache.
    SecureObject.setSessionDerivedKey({ PBKDF2: {} as JsonWebKey });
  });

  describe('clone', () => {
    it('should propagate the decrypted read cache to the clone (regression)', () => {
      const obj = new TestSecureObject();
      obj.set('secret', 'top-secret');

      expect(obj.get('secret')).toBe('top-secret');

      const clone = obj.clone();

      // Before the fix, clone() copied in the wrong direction and the clone's cache stayed empty.
      expect(clone.get('secret')).toBe('top-secret');
    });
  });
});
