import { Crypto, CryptoUtils } from '../index';
import { BaseObject } from './BaseObject';

const perf = {
  time: 0,
  ops: 0,
};

type ReadCacheType = Record<string, unknown>;

export abstract class SecureObject extends BaseObject {
  private static isServer = false;
  private static sessionDerivedKey: CryptoUtils.DerivedKey;
  private readonly secureFields: string[] = [];

  private _decryptPromise: Promise<void> = null;
  private _decryptedReadCache: ReadCacheType = {};
  private _dirtyCache: { [key: string]: boolean } = {};

  public static setServerMode(): void {
    SecureObject.isServer = true;
  }

  protected constructor(className: string, secureFields: string[]) {
    super(className);

    this.secureFields = secureFields;
  }

  static setSessionDerivedKey(derived: CryptoUtils.DerivedKey): void {
    SecureObject.sessionDerivedKey = derived;
  }

  public _secureFields(): string[] {
    return this.secureFields;
  }

  public async decrypt(force = false): Promise<void> {
    if (force || this._decryptPromise === null) {
      this._decryptPromise = this.doDecrypt();
    }
    return this._decryptPromise;
  }

  private async doDecrypt(): Promise<void> {
    if (SecureObject.isServer) {
      return;
    }

    if (!SecureObject.sessionDerivedKey) {
      throw 'Encryption key not set"';
    }

    const _decryptedReadCache: ReadCacheType = {};

    await Promise.all(
      this.secureFields.map(async fieldName => {
        const val = super.get(fieldName);

        if (val === undefined || val === null) {
          return; // Skip null/undefined values. This will occur if we add new encrypted fields to the schema.
        }

        this._dirtyCache[fieldName] = false;
        _decryptedReadCache[fieldName] = Crypto.isEncrypted(val)
          ? await SecureObject.decryptField(val)
          : val;
      })
    );

    this._decryptedReadCache = _decryptedReadCache;
  }

  clone(): this {
    const clone = super.clone();

    for (const [k, v] of Object.entries(clone._decryptedReadCache)) {
      this._decryptedReadCache[k] = v;
    }
    return clone;
  }

  public static async decryptField<T>(val: CryptoUtils.EncryptedValue): Promise<T | undefined> {
    const start = window.performance.now();

    const decrypted = await Crypto.decrypt<T>(SecureObject.sessionDerivedKey, val);

    perf.time += window.performance.now() - start;
    //console.log(++perf.ops, perf.time)
    return decrypted;
  }

  public static async encryptField<T>(val: T): Promise<CryptoUtils.EncryptedValue> {
    if (Crypto.isEncrypted(val as unknown as CryptoUtils.EncryptedValue)) {
      throw 'Already encrypted';

      // return val as unknown as CryptoUtils.EncryptedValue; // unreachable code [eslint]
    }

    if (val instanceof Parse.Object) {
      throw 'When setting Secure Fields, you cannot persists objects themselves, you need to use "myObject.toPointer()"';
    }

    return await Crypto.encrypt(SecureObject.sessionDerivedKey, val);
  }

  private async doEncryptFields(): Promise<void> {
    await Promise.all(
      Object.entries(this._dirtyCache).map(async ([fieldName, isDirty]) => {
        if (!isDirty) {
          return;
        }

        const value = this._decryptedReadCache[fieldName];
        super.set(fieldName, await SecureObject.encryptField(value));
      })
    );
  }

  async save(
    target: SecureObject | Array<SecureObject | Parse.File> | undefined = undefined,
    options: Parse.RequestOptions | undefined = undefined
  ): Promise<this> {
    await this.doEncryptFields();

    return await super.save(target, options);
  }

  static async saveAll<T extends readonly BaseObject[]>(
    list: T,
    options?: Parse.Object.SaveAllOptions
  ): Promise<T> {
    await Promise.all(
      list.map(async obj => {
        if (obj instanceof SecureObject) {
          await obj.doEncryptFields();
        }
      })
    );

    return await BaseObject.saveAll(list, options);
  }

  public get<T>(attr: string): T {
    const val = super.get(attr);

    if (SecureObject.isServer || !this.secureFields.includes(attr)) {
      return val;
    }

    return this._decryptedReadCache[attr] as T;
  }

  public set<T>(
    key: string | { [key: string]: unknown },
    value: T | undefined = undefined,
    options: unknown = undefined
  ): this | false {
    if (SecureObject.isServer) {
      return super.set(key as string, value, options);
    }

    if (!SecureObject.sessionDerivedKey) {
      throw 'Encryption key not set"';
    }

    const setValue = (k: string, v: unknown) => {
      if (!this.secureFields.includes(k)) {
        return super.set(k as string, v, options);
      }

      if (v instanceof Parse.Object) {
        throw 'When setting Secure Fields, you cannot persists objects themselves, you need to use "myObject.toPointer()"';
      }

      this._dirtyCache[k] = true;
      this._decryptedReadCache[k] = v;

      return this;
    };

    if (key && typeof key === 'object') {
      for (const k in key) {
        if (!Object.prototype.hasOwnProperty.call(key, k)) {
          continue;
        }

        setValue(k, key[k]);
      }

      return this;
    }

    return setValue(key as string, value);
  }
}
