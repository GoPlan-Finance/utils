import { Query, BaseObject, SecureObject } from '@utils/index';

// A plain test subclass and a second one to exercise the "same class" guard in whereQueries().
class TestObject extends BaseObject {
  static className = 'TestObject';
  constructor() {
    super('TestObject');
  }
}
Parse.Object.registerSubclass('TestObject', TestObject);

class OtherObject extends BaseObject {
  static className = 'OtherObject';
  constructor() {
    super('OtherObject');
  }
}
Parse.Object.registerSubclass('OtherObject', OtherObject);

class SecureTest extends SecureObject {
  static className = 'SecureTest';
  constructor() {
    super('SecureTest', ['secret']);
  }
}
Parse.Object.registerSubclass('SecureTest', SecureTest);

// A minimal stand-in for a logged-in user carrying a session token.

const fakeUser = (token: string): any => ({ getSessionToken: () => token });

describe('Query', () => {
  let requestMock: jest.Mock<Promise<any>, any>;

  let getResponse: any;

  const lastCall = () => requestMock.mock.calls[requestMock.mock.calls.length - 1];
  const lastData = () => lastCall()[2];
  const lastOptions = () => lastCall()[3];

  const posts = () => requestMock.mock.calls.filter((c: any[]) => c[0] === 'POST');

  beforeEach(() => {
    getResponse = { results: [] };

    requestMock = jest.fn((method: string) => {
      if (method === 'POST' || method === 'PUT') {
        return Promise.resolve({
          objectId: 'created-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return Promise.resolve(getResponse);
    });

    (Parse.CoreManager as any).setRESTController({
      request: requestMock,
      ajax: jest.fn(),
    });
  });

  describe('prepareOptions / auth plumbing', () => {
    it('sends no sessionToken or masterKey by default', async () => {
      await Query.create(TestObject).find();
      expect(lastOptions().sessionToken).toBeUndefined();
      expect(lastOptions().useMasterKey).toBeUndefined();
    });

    it('applies runAsUser sessionToken to find', async () => {
      await Query.create(TestObject).runAsUser(fakeUser('r:tok')).find();
      expect(lastOptions().sessionToken).toBe('r:tok');
    });

    it('clears the sessionToken when runAsUser(null) is used', async () => {
      await Query.create(TestObject).runAsUser(fakeUser('r:tok')).runAsUser(null).find();
      expect(lastOptions().sessionToken).toBeUndefined();
    });

    it('applies useMasterKey(true) to find', async () => {
      await Query.create(TestObject).useMasterKey(true).find();
      expect(lastOptions().useMasterKey).toBe(true);
    });

    it('lets a per-call useMasterKey argument override on getOrNull', async () => {
      getResponse = { results: [{ objectId: 'a' }] };

      await Query.create(TestObject).getOrNull('a', true);
      expect(lastOptions().useMasterKey).toBe(true);

      await Query.create(TestObject).getOrNull('a', false);
      expect(lastOptions().useMasterKey).toBe(false);
    });
  });

  describe('clone', () => {
    it('preserves auth state and include tracking', async () => {
      const original = Query.create(TestObject)
        .runAsUser(fakeUser('r:tok'))
        .useMasterKey(true)
        .include('owner');

      const cloned = original.clone();
      expect(cloned).toBeInstanceOf(Query);
      expect(cloned).not.toBe(original);

      await cloned.find();
      expect(lastOptions().sessionToken).toBe('r:tok');
      expect(lastOptions().useMasterKey).toBe(true);
      expect(String(lastData().include)).toContain('owner');
    });
  });

  describe('include / limit / skip', () => {
    it('tracks a single include and an array of includes', async () => {
      await Query.create(TestObject).include('a').include(['b', 'c']).find();
      const include = String(lastData().include);
      expect(include).toContain('a');
      expect(include).toContain('b');
      expect(include).toContain('c');
    });

    it('forwards limit and skip', async () => {
      await Query.create(TestObject).limit(5).skip(2).find();
      expect(lastData().limit).toBe(5);
      expect(lastData().skip).toBe(2);
    });
  });

  describe('whereQueries', () => {
    it('builds a combined query for and / or / nor', () => {
      for (const handler of ['and', 'or', 'nor'] as const) {
        const combined = Query.whereQueries(handler, [
          Query.create(TestObject),
          Query.create(TestObject),
        ]);
        expect(combined).toBeInstanceOf(Query);
      }
    });

    it('throws when the queries target different classes', () => {
      expect(() =>
        Query.whereQueries('and', [Query.create(TestObject), Query.create(OtherObject)])
      ).toThrow('All queries must be for the same class.');
    });
  });

  describe('findWithCount', () => {
    it('returns both results and count', async () => {
      getResponse = { results: [{ objectId: 'a' }], count: 7 };
      const res = await Query.create(TestObject).findWithCount();
      expect(res.count).toBe(7);
      expect(res.results).toHaveLength(1);
    });
  });

  describe('count', () => {
    it('returns the server count', async () => {
      getResponse = { count: 42, results: [] };
      expect(await Query.create(TestObject).count()).toBe(42);
    });
  });

  describe('getObjectById', () => {
    it('resolves by string id', async () => {
      getResponse = { results: [{ objectId: 'x' }] };
      const doc = await Query.create(TestObject).getObjectById('x');
      expect(doc.id).toBe('x');
    });

    it('resolves from a Parse.Object instance', async () => {
      getResponse = { results: [{ objectId: 'y' }] };
      const input = BaseObject.fromJSON<TestObject, { objectId: string }>(TestObject, {
        objectId: 'y',
      });
      const doc = await Query.create(TestObject).getObjectById(input);
      expect(doc.id).toBe('y');
    });

    it('resolves from a Pointer interface', async () => {
      getResponse = { results: [{ objectId: 'p1' }] };
      const pointer = BaseObject.createPointer.call(TestObject, 'p1');
      const doc = await Query.create(TestObject).getObjectById(pointer);
      expect(doc.id).toBe('p1');
    });

    it('throws INVALID_QUERY for an unsupported input type', async () => {
      await expect(Query.create(TestObject).getObjectById(123 as any)).rejects.toThrow();
    });

    it('throws OBJECT_NOT_FOUND when the id does not exist', async () => {
      getResponse = { results: [] };
      await expect(Query.create(TestObject).getObjectById('missing')).rejects.toThrow(/not found/i);
    });
  });

  describe('findBy / findOneBy', () => {
    it('findBy adds an equalTo constraint per param', async () => {
      getResponse = { results: [{ objectId: 'a' }] };
      const res = await Query.create(TestObject).findBy({ a: '1', b: 2 });
      expect(res).toHaveLength(1);
      expect(lastData().where).toMatchObject({ a: '1', b: 2 });
    });

    it('findOneBy queries the first matching record', async () => {
      getResponse = { results: [{ objectId: 'a', a: '1' }] };
      const res = await Query.create(TestObject).findOneBy({ a: '1' } as Partial<TestObject>);
      expect(res?.id).toBe('a');
      expect(lastData().where).toMatchObject({ a: '1' });
      expect(lastData().limit).toBe(1);
    });
  });

  describe('findOrCreate', () => {
    it('returns the existing object without creating', async () => {
      getResponse = { results: [{ objectId: 'exists', a: '1' }] };
      const res = await Query.create(TestObject).findOrCreate({ a: '1' } as Partial<TestObject>);
      expect(res.id).toBe('exists');
      expect(posts()).toHaveLength(0);
    });

    it('creates and saves when nothing matches', async () => {
      getResponse = { results: [] };
      const res = await Query.create(TestObject).findOrCreate({ a: '1' } as Partial<TestObject>);
      expect(res.id).toBe('created-id');
      expect(res.get('a')).toBe('1');
      expect(posts()).toHaveLength(1);
    });

    it('does not save when save=false and applies createParams', async () => {
      getResponse = { results: [] };
      const res = await Query.create(TestObject).findOrCreate(
        { a: '1' } as Partial<TestObject>,
        undefined,
        false,
        { b: '2' } as Partial<TestObject>
      );
      expect(res.id).toBeUndefined();
      expect(res.get('a')).toBe('1');
      expect(res.get('b')).toBe('2');
      expect(posts()).toHaveLength(0);
    });
  });

  describe('decryption hooks', () => {
    let decryptSpy: jest.SpyInstance;

    beforeEach(() => {
      decryptSpy = jest

        .spyOn(SecureObject.prototype as any, 'decrypt')
        .mockResolvedValue(undefined);
    });

    afterEach(() => decryptSpy.mockRestore());

    it('decrypts SecureObjects returned by find', async () => {
      getResponse = { results: [{ objectId: 's1' }] };
      await Query.create(SecureTest).find();
      expect(decryptSpy).toHaveBeenCalled();
    });

    it('decrypts a SecureObject returned by first', async () => {
      getResponse = { results: [{ objectId: 's1' }] };
      await Query.create(SecureTest).first();
      expect(decryptSpy).toHaveBeenCalled();
    });

    it('does not attempt decryption for plain objects', async () => {
      getResponse = { results: [{ objectId: 'a' }] };
      await Query.create(TestObject).find();
      expect(decryptSpy).not.toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    let subscribeSpy: jest.SpyInstance;

    beforeEach(() => {
      subscribeSpy = jest

        .spyOn(Parse.Query.prototype as any, 'subscribe')

        .mockResolvedValue({ on: jest.fn() } as any);
    });

    afterEach(() => subscribeSpy.mockRestore());

    it('prefers an explicit token argument', async () => {
      await Query.create(TestObject).runAsUser(fakeUser('r:runas')).subscribe('r:explicit');
      expect(subscribeSpy).toHaveBeenCalledWith('r:explicit');
    });

    it('falls back to the runAsUser token', async () => {
      await Query.create(TestObject).runAsUser(fakeUser('r:runas')).subscribe();
      expect(subscribeSpy).toHaveBeenCalledWith('r:runas');
    });

    it('passes undefined when there is no token', async () => {
      await Query.create(TestObject).subscribe();
      expect(subscribeSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('aggregate / distinct / findAll / each', () => {
    it('aggregate issues an aggregate request and returns the results', async () => {
      getResponse = { results: [{ objectId: 'agg' }] };

      const res: any = await Query.create(TestObject).aggregate([
        { group: { objectId: null } },
      ] as any);
      expect(lastCall()[0]).toBe('GET');
      expect(lastCall()[1]).toBe('aggregate/TestObject');
      expect(Array.isArray(res)).toBe(true);
      expect(res).toHaveLength(1);
    });

    it('distinct returns the server values', async () => {
      getResponse = { results: ['x', 'y'] };
      const res = await Query.create(TestObject).distinct('field' as never);
      expect(res).toStrictEqual(['x', 'y']);
    });

    it('findAll returns decoded objects', async () => {
      getResponse = { results: [{ objectId: 'a' }] };
      const res = await Query.create(TestObject).findAll();
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('a');
    });

    it('each invokes the callback for every object', async () => {
      getResponse = { results: [{ objectId: 'a' }] };
      const seen: string[] = [];
      await Query.create(TestObject).each(obj => {
        seen.push(obj.id);
      });
      expect(seen).toStrictEqual(['a']);
    });
  });

  describe('fromJSON', () => {
    it('round-trips a serialized query', () => {
      const original = Query.create(TestObject);

      original.equalTo('a', '1' as any);
      const json = original.toJSON();

      const restored = Query.fromJSON(TestObject, json);
      expect(restored).toBeInstanceOf(Query);
      expect(restored.toJSON()).toEqual(json);
    });
  });

  describe('liveQuery', () => {
    let handlers: Record<string, (item: any) => void>;
    let subscribeSpy: jest.SpyInstance;

    beforeEach(() => {
      handlers = {};
      const subscription = {
        on: (event: string, cb: (item: any) => void) => {
          handlers[event] = cb;
        },
      };
      subscribeSpy = jest

        .spyOn(Parse.Query.prototype as any, 'subscribe')

        .mockResolvedValue(subscription as any);
    });

    afterEach(() => subscribeSpy.mockRestore());

    const tick = () => new Promise(resolve => setTimeout(resolve, 0));

    it('populates the initial collection and reconciles live events', async () => {
      getResponse = { results: [{ objectId: 'a' }] };

      const objects: any[] = [];
      const events: Array<[string, string | null]> = [];

      await Query.create(TestObject).liveQuery(objects, (obj, event) => {
        events.push([obj.id, event]);
      });

      // Initial find() results are seeded into the collection with a null event.
      expect(objects.map(o => o.id)).toStrictEqual(['a']);
      expect(events).toContainEqual(['a', null]);

      // A "create" event for a new id appends to the collection.
      handlers['create'](BaseObject.fromJSON(TestObject, { objectId: 'b' }));
      await tick();
      expect(objects.map(o => o.id).sort()).toStrictEqual(['a', 'b']);

      // An "update" event for an existing id replaces it in place.
      handlers['update'](BaseObject.fromJSON(TestObject, { objectId: 'b' }));
      await tick();
      expect(objects.map(o => o.id).sort()).toStrictEqual(['a', 'b']);

      // A "delete" event removes the matching object.
      handlers['delete'](objects.find(o => o.id === 'a'));
      await tick();
      expect(objects.map(o => o.id)).toStrictEqual(['b']);
    });

    it('returns the subscription without a collection', async () => {
      getResponse = { results: [] };
      const sub = await Query.create(TestObject).liveQuery();
      expect(sub).toBeDefined();
      expect(subscribeSpy).toHaveBeenCalled();
    });
  });
});
