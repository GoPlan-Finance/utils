import { Query, CacheableQuery, BaseObject } from '@utils/index';
import { MASTER } from './testUtils';

class Widget extends BaseObject {
  static className = 'Widget';
  constructor() {
    super('Widget');
  }
}
Widget.register();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeWidget = (attrs: Record<string, any>): Widget => {
  const w = new Widget();
  w.set(attrs);
  return w;
};

describe('Query (integration, real Parse Server + in-memory Mongo)', () => {
  afterEach(async () => {
    const existing = await Query.create(Widget).find(MASTER);
    await Parse.Object.destroyAll(existing, MASTER);
  });

  describe('CRUD & finders', () => {
    it('saves and retrieves via findBy', async () => {
      const w = makeWidget({ name: 'alpha', color: 'red' });
      await w.save(null, MASTER);

      const found = await Query.create(Widget).findBy({ name: 'alpha' }, true);
      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(w.id);
      expect(found[0].get('color')).toBe('red');
    });

    it('findOneBy returns a single matching record', async () => {
      await makeWidget({ name: 'beta', color: 'blue' }).save(null, MASTER);
      const one = await Query.create(Widget).findOneBy({ name: 'beta' } as Partial<Widget>, true);
      expect(one?.get('color')).toBe('blue');
    });

    it('getObjectById resolves by id and by pointer, and throws when missing', async () => {
      const w = makeWidget({ name: 'gamma' });
      await w.save(null, MASTER);

      const byId = await Query.create(Widget).getObjectById(w.id, true);
      expect(byId.id).toBe(w.id);

      const pointer = BaseObject.createPointer.call(Widget, w.id);
      const byPointer = await Query.create(Widget).getObjectById(pointer, true);
      expect(byPointer.id).toBe(w.id);

      await expect(Query.create(Widget).getObjectById('missing-id', true)).rejects.toThrow();
    });

    it('count reflects the number of stored objects', async () => {
      await makeWidget({ name: 'a' }).save(null, MASTER);
      await makeWidget({ name: 'b' }).save(null, MASTER);
      expect(await Query.create(Widget).count(MASTER)).toBe(2);
    });

    it('findAll returns every object', async () => {
      await Parse.Object.saveAll(
        [makeWidget({ name: 'a' }), makeWidget({ name: 'b' }), makeWidget({ name: 'c' })],
        MASTER
      );
      const all = await Query.create(Widget).findAll(MASTER);
      expect(all).toHaveLength(3);
    });

    it('each iterates over every object', async () => {
      await Parse.Object.saveAll(
        [makeWidget({ name: 'a' }), makeWidget({ name: 'b' })],
        MASTER
      );
      const seen: string[] = [];
      await Query.create(Widget).each(w => {
        seen.push(w.get('name'));
      }, MASTER);
      expect(seen.sort()).toStrictEqual(['a', 'b']);
    });
  });

  describe('distinct & aggregate', () => {
    beforeEach(async () => {
      await Parse.Object.saveAll(
        [
          makeWidget({ name: 'a', color: 'red' }),
          makeWidget({ name: 'b', color: 'red' }),
          makeWidget({ name: 'c', color: 'green' }),
        ],
        MASTER
      );
    });

    it('distinct returns the unique values of a field', async () => {
      const colors = await Query.create(Widget)
        .useMasterKey(true)
        .distinct('color' as never);
      expect((colors as string[]).sort()).toStrictEqual(['green', 'red']);
    });

    it('aggregate runs a server-side pipeline', async () => {
      const results = await Query.create(Widget)
        .useMasterKey(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .aggregate([{ $group: { _id: null, total: { $sum: 1 } } }] as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = results as any[];
      expect(Array.isArray(rows)).toBe(true);
      expect(rows[0].total).toBe(3);
    });
  });

  describe('findOrCreate', () => {
    it('creates when missing and returns the existing object next time', async () => {
      const created = await Query.create(Widget).findOrCreate(
        { name: 'unique', color: 'red' } as Partial<Widget>,
        true
      );
      expect(created.id).toBeDefined();
      expect(created.get('color')).toBe('red');

      const second = await Query.create(Widget).findOrCreate(
        { name: 'unique' } as Partial<Widget>,
        true
      );
      expect(second.id).toBe(created.id);
    });

    it('serializes concurrent calls via the per-class mutex (no duplicates)', async () => {
      const params = { name: 'race' } as Partial<Widget>;

      const results = await Promise.all(
        Array.from({ length: 6 }, () => Query.create(Widget).findOrCreate(params, true))
      );

      const ids = new Set(results.map(r => r.id));
      expect(ids.size).toBe(1);

      const stored = await Query.create(Widget).findBy({ name: 'race' }, true);
      expect(stored).toHaveLength(1);
    });
  });

  describe('CacheableQuery', () => {
    it('caches results so identical queries do not re-hit the server', async () => {
      await makeWidget({ name: 'cache-key' }).save(null, MASTER);

      const cq = CacheableQuery.create(Widget);
      const first = await cq.findBy({ name: 'cache-key' }, true);
      expect(first).toHaveLength(1);

      // Mutating the DB after the first (cached) call must not change the cached result.
      await makeWidget({ name: 'cache-key' }).save(null, MASTER);
      const second = await cq.findBy({ name: 'cache-key' }, true);
      expect(second).toHaveLength(1);

      // A fresh (uncached) query observes both rows.
      const fresh = await Query.create(Widget).findBy({ name: 'cache-key' }, true);
      expect(fresh).toHaveLength(2);
    });
  });
});
