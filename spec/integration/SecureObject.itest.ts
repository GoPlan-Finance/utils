import { Crypto, Query, SecureObject, BaseObject } from '@utils/index';
import { MASTER } from './testUtils';

class Secret extends SecureObject {
  static className = 'Secret';
  constructor() {
    super('Secret', ['payload']);
  }
}
Secret.register();

describe('SecureObject (integration, real Parse Server + WebCrypto)', () => {
  beforeAll(async () => {
    const salt = Crypto.randomSalt();
    const derived = await Crypto.PBKDF2('correct horse battery staple', salt);
    SecureObject.setSessionDerivedKey(derived);
  });

  afterEach(async () => {
    const existing = await Query.create(Secret).find(MASTER);
    await Parse.Object.destroyAll(existing, MASTER);
  });

  it('encrypts secure fields at rest and decrypts them on read', async () => {
    const obj = new Secret();
    obj.set('label', 'public-label'); // non-secure field, stored as-is
    obj.set('payload', { ssn: '123-45-6789', note: 'sensitive' }); // secure field
    await obj.save(null, MASTER);

    // At rest: read the raw document with a vanilla Parse query (no auto-decrypt).
    // The stored payload must be an encrypted envelope, not the plaintext.
    const raw = await new Parse.Query(Secret).first(MASTER);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawPayload = (raw as any).toJSON().payload;
    expect(Crypto.isEncrypted(rawPayload)).toBe(true);
    expect(JSON.stringify(rawPayload)).not.toContain('123-45-6789');

    // Through our Query, the object is transparently decrypted on read.
    const fetched = await Query.create(Secret).first(MASTER);
    expect(fetched?.get('label')).toBe('public-label');
    expect(fetched?.get('payload')).toStrictEqual({ ssn: '123-45-6789', note: 'sensitive' });
  });

  it('round-trips several values, including via findBy', async () => {
    const a = new Secret();
    a.set('label', 'a');
    a.set('payload', { v: 1 });
    const b = new Secret();
    b.set('label', 'b');
    b.set('payload', { v: 2 });

    await SecureObject.saveAll([a, b] as unknown as BaseObject[], MASTER);

    const results = await Query.create(Secret).findBy({ label: 'b' }, true);
    expect(results).toHaveLength(1);
    expect(results[0].get('payload')).toStrictEqual({ v: 2 });
  });

  it('rejects encrypting an already-encrypted value', async () => {
    const encrypted = await SecureObject.encryptField({ v: 42 });
    await expect(SecureObject.encryptField(encrypted)).rejects.toBeDefined();
  });
});

describe('Crypto (integration, WebCrypto)', () => {
  it('PBKDF2 + encrypt/decrypt round-trips arbitrary JSON', async () => {
    const salt = Crypto.randomSalt();
    const derived = await Crypto.PBKDF2('pw', salt);

    const payload = { a: 1, nested: { b: [1, 2, 3] }, s: 'hello' };
    const encrypted = await Crypto.encrypt(derived, payload);

    expect(Crypto.isEncrypted(encrypted)).toBe(true);
    expect(typeof encrypted.ct).toBe('string');
    expect(typeof encrypted.iv).toBe('string');

    const decrypted = await Crypto.decrypt(derived, encrypted);
    expect(decrypted).toStrictEqual(payload);
  });

  it('produces different ciphertext for each encryption (random IV)', async () => {
    const derived = await Crypto.PBKDF2('pw', Crypto.randomSalt());
    const one = await Crypto.encrypt(derived, 'same');
    const two = await Crypto.encrypt(derived, 'same');
    expect(one.ct).not.toBe(two.ct);
    expect(one.iv).not.toBe(two.iv);
  });

  it('fails to decrypt with the wrong key', async () => {
    const good = await Crypto.PBKDF2('pw', Crypto.randomSalt());
    const bad = await Crypto.PBKDF2('other', Crypto.randomSalt());
    const encrypted = await Crypto.encrypt(good, { secret: true });
    await expect(Crypto.decrypt(bad, encrypted)).rejects.toBeDefined();
  });
});
