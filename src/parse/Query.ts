/**
 *
 *
 *
 */
import { Mutex } from 'async-mutex';

import { BaseObject } from './BaseObject';
import { SecureObject } from './SecureObject';

export type LiveQueryUpdateFnEventType = null | 'updated' | 'created' | 'deleted';
export type LiveQueryUpdateFn<T> = (obj: T, event: LiveQueryUpdateFnEventType) => void;
export type Constructible<T> = new (...args: unknown[]) => T;

export interface PointerInterface {
  __type: string | 'Pointer';
  className: string;
  objectId: string;
}

export class Query<T extends Parse.Object> extends Parse.Query<T> {
  static objectCreationMutexes: Record<string, Mutex> = {};
  private useWithCount = false;

  // objectClass : Constructible<T>

  constructor(objectClass: Constructible<T>) {
    super(objectClass);

    this.objectClass = objectClass;
  }

  static create<U extends Parse.Object>(objectClass: Constructible<U>): Query<U> {
    return new Query<U>(objectClass);
  }

  static whereQueries<U extends Parse.Object>(
    handler: 'and' | 'or' | 'nor',
    queries: Array<Query<U>>
  ): Query<U> {
    const _getObjectClassForQueries = <U extends Parse.Object>(
      queries: Query<U>[]
    ): Constructible<U> => {
      let objectClass: Constructible<U> = null;
      queries.forEach(q => {
        if (!objectClass) {
          objectClass = q.objectClass;
        }

        if (objectClass !== q.objectClass) {
          throw new Error('All queries must be for the same class.');
        }
      });
      return objectClass;
    };

    const objectClass = _getObjectClassForQueries(queries);

    const query = new Query<U>(objectClass);
    // @ts-expect-error missing parse TS def
    query[`_${handler}Query`](queries);
    return query;
  }

  /**
   * Run a query on a collection
   * @param objects The array where objects will be added
   * @param updateFn A function that take a single object, that can be used to manipulate the object before it is added
   *                 to the array
   */
  public async liveQuery(
    objects: T[] | null = null,
    updateFn?: LiveQueryUpdateFn<T>
  ): Promise<Parse.LiveQuerySubscription> {
    const expandIncludes = async (object: T) => {
      // @todo  We can probably remove this. More testing needed to see if LiveSubscriptions return objects with
      // include()
      const includes = this.toJSON().include;

      if (!includes) {
        return;
      }

      const promises = includes.split(',').map(async (include: string) => {
        const val = object.get(include);

        if (val && val.__type === 'Pointer') {
          const obj = await Parse.Object.extend(val.className)
            .createWithoutData(val.objectId)
            .fetch();

          object.set(include, obj);
          console.warn('replaced pointer', val, obj);
        }
      });

      await Promise.all(promises);
    };

    const replace = async (object: T, event: LiveQueryUpdateFnEventType) => {
      // await expandIncludes(object)

      if (object instanceof SecureObject) {
        await object.decrypt();
      }

      if (updateFn) {
        await updateFn(object, event);
      }

      if (objects !== null) {
        const index = objects.findIndex(o => o.id === object.id);

        if (index !== -1) {
          objects[index] = object;
          return;
        }

        if (event) {
          objects.push(object);
        }
      }
    };

    const remove = async (object: T) => {
      if (object instanceof SecureObject) {
        await object.decrypt();
      }

      if (updateFn) {
        await updateFn(object, 'deleted');
      }

      if (objects !== null) {
        const index = objects.findIndex(o => o.id === object.id);

        if (index !== -1) {
          // delete objects[index]
          objects.splice(index, 1);
        }
      }
    };

    if (objects) {
      const tmpObjects: T[] = [];

      for (const object of await this.find()) {
        if (updateFn) {
          await updateFn(object, null);
        }
        tmpObjects.push(object);
      }

      objects.push(...tmpObjects);
    }

    const subscription = await this.subscribe();

    subscription.on('create', item => {
      replace(item as T, 'created');
    });

    subscription.on('update', item => {
      replace(item as T, 'updated');
    });

    subscription.on('delete', item => {
      remove(item as T);
    });

    return subscription;
  }

  public async getOrNull(docId: string, useMasterKey = false): Promise<T> {
    return this.get(docId, BaseObject.useMasterKey(useMasterKey));
  }

  public async getObjectById(
    docId: string | PointerInterface | T,
    useMasterKey = false
  ): Promise<T> {
    if (docId instanceof Parse.Object) {
      return docId;
    }

    if (typeof docId === 'object' && docId.__type === 'Pointer') {
      if (typeof docId.objectId === 'string') {
        docId = docId.objectId;
      }
    }

    const doc = await this.getOrNull(docId as string, useMasterKey);

    if (doc) {
      return doc;
    }

    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Document ${docId} not found`);
  }

  public async findBy(
    params: {
      [key: string]: string | boolean | number | Parse.Object | Parse.Pointer;
    },
    useMasterKey = false
  ): Promise<T[]> {
    for (const [k, v] of Object.entries(params)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.equalTo(k, v);
    }

    return this.find(BaseObject.useMasterKey(useMasterKey));
  }

  public async findOneBy<K extends Extract<keyof T, string>>(
    params: Partial<Pick<T, K>> | T,
    useMasterKey = false
  ): Promise<T | undefined> {
    for (const [k, v] of Object.entries(params)) {
      this.equalTo(k, v);
    }

    return await this.first(BaseObject.useMasterKey(useMasterKey));
  }

  private createObject(): T {
    return new this.objectClass();
  }

  private getCreateMutex(): Mutex {
    let mutex = Query.objectCreationMutexes[this.objectClass.className];

    if (!mutex) {
      mutex = Query.objectCreationMutexes[this.objectClass.className] = new Mutex();
    }

    return mutex;
  }

  public async findOrCreate<K extends Extract<keyof T, string>>(
    params: Partial<Pick<T, K>> | T,
    useMasterKey = false,
    save = true,
    createParams: Partial<Pick<T, K>> | T | undefined = undefined
  ): Promise<T> {
    const mutex = this.getCreateMutex();

    return await mutex.runExclusive(async () => {
      const obj = await this.findOneBy(params, useMasterKey);

      if (obj) {
        return obj;
      }

      const obj2 = this.createObject();

      obj2.set(params);

      if (createParams !== undefined) {
        obj2.set(createParams);
      }

      if (!save) {
        return obj2;
      }

      return await obj2.save(null, BaseObject.useMasterKey(useMasterKey));
    });
  }

  public withCount(includeCount?: boolean): this {
    this.useWithCount = includeCount;
    super.withCount(includeCount);
    return this;
  }

  public async get(objectId: string, options?: Parse.Query.GetOptions): Promise<T> {
    const obj = await super.get(objectId, options);

    if (obj instanceof SecureObject) {
      await (obj as SecureObject).decrypt();
    }

    return obj;
  }

  private _getResults(objects: T[] | { results: T[]; count: number }): T[] {
    if (Array.isArray(objects) && this.useWithCount) {
      return objects;
    }

    // @ts-expect-error missing TS in Parse
    return objects.results;
  }

  async find(options?: Parse.Query.FindOptions): Promise<T[]> {
    const objects = await super.find(options);

    const maybeDecrypt = async (objs: T[]) => {
      for (const obj of objs) {
        if (obj instanceof SecureObject) {
          await (obj as SecureObject).decrypt();
        }
      }
    };

    await maybeDecrypt(this._getResults(objects));

    return objects;
  }
}
