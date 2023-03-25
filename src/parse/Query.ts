/**
 *
 *
 *
 */
import { User } from './User';
import { Mutex } from 'async-mutex';

import { BaseObject } from './BaseObject';
import { SecureObject } from './SecureObject';
import { ObjectPathUtils } from '../ObjectPathUtils';

export type LiveQueryUpdateFnEventType =
  | null
  | 'open'
  | 'create'
  | 'update'
  | 'enter'
  | 'leave'
  | 'delete'
  | 'close';

export type LiveQueryUpdateFn<T> = (obj: T, event: LiveQueryUpdateFnEventType) => void;
export type Constructible<T> = new (...args: unknown[]) => T;
type QueryAttribute<T> = Extract<keyof T, string> | string;
type QueryAttributes<T> = QueryAttribute<T>[];

export interface PointerInterface {
  __type: string | 'Pointer';
  className: string;
  objectId: string;
}

interface QueryResultWithCount<T> {
  results: T[];
  count: number;
}

export default class Query<T extends Parse.Object> extends Parse.Query<T> {
  static objectCreationMutexes: Record<string, Mutex> = {};
  private useWithCount = false;
  private useInclude: QueryAttributes<T> = [];
  private sessionToken: string = null;

  // objectClass : Constructible<T>
  private masterKey: boolean;

  constructor(objectClass: Constructible<T>) {
    super(objectClass);

    this.objectClass = objectClass;
  }

  static create<U extends Parse.Object>(objectClass: Constructible<U>): Query<U> {
    return new Query<U>(objectClass);
  }

  static fromJSON<U extends Parse.Object>(objectClass: Constructible<U>, json: unknown): Query<U> {
    return Query.create(objectClass).withJSON(json);
  }

  public clone(): Query<T> {
    return Query.create(this.objectClass as Constructible<T>).withJSON(this.toJSON());
  }

  public runAsUser(user: User | null): this {
    this.sessionToken = user ? user.getSessionToken() : null;
    return this;
  }

  public useMasterKey(useMasterKey: boolean): this {
    this.masterKey = useMasterKey;
    return this;
  }

  public includeAll(): this {
    return super.includeAll() as this;
  }

  public include(key: QueryAttribute<T> | QueryAttributes<T>): this {
    // @ts-expect-error simplified type
    super.include(key);
    if (!Array.isArray(key)) {
      key = [key];
    }

    this.useInclude.push(...key);
    return this;
  }

  limit(n: number): this {
    super.limit(n);
    return this;
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
        await updateFn(object, 'delete');
      }

      if (objects !== null) {
        const index = objects.findIndex(o => o.id === object.id);

        if (index !== -1) {
          // delete objects[index]
          objects.splice(index, 1);
        }
      }
    };

    if (Array.isArray(objects)) {
      const tmpObjects: T[] = await this.maybeDecrypt(this._getResults(await this.find()));

      if (updateFn) {
        for (const object of tmpObjects) {
          await updateFn(object, null);
        }
      }

      objects.push(...tmpObjects);
    }

    const subscription = await this.subscribe();
    // event: "open" | "create" | "update" | "enter" | "leave" | "delete" | "close"

    // subscription.on('open', item => {
    //   replace(item as T, 'created');
    // });

    subscription.on('create', item => {
      replace(item as T, 'create');
    });

    subscription.on('update', item => {
      replace(item as T, 'update');
    });

    subscription.on('enter', item => {
      replace(item as T, 'enter');
    });

    subscription.on('leave', item => {
      replace(item as T, 'leave');
    });

    subscription.on('delete', item => {
      remove(item as T);
    });

    // subscription.on('close', item => {
    // });

    return subscription;
  }

  public async getOrNull(docId: string, useMasterKey: boolean = undefined): Promise<T> {
    return this.get(docId, this.prepareOptions({}, useMasterKey));
  }

  // Type guard function to narrow the type of value to PointerInterface
  private isPointerInterface(value: any): value is PointerInterface {
    return typeof value === 'object' && value.__type === 'Pointer';
  }
  public async getObjectById(
    objectOrId: string | PointerInterface | T,
    useMasterKey: boolean = undefined
  ): Promise<T> {
    let docId = null;

    if (typeof objectOrId === 'string') {
      docId = objectOrId;
    } else if (objectOrId instanceof Parse.Object) {
      docId = objectOrId.id;
    } else if (this.isPointerInterface(objectOrId)) {
      if (typeof objectOrId.objectId === 'string') {
        docId = objectOrId.objectId;
      }
    } else {
      throw new Parse.Error(
        Parse.Error.INVALID_QUERY,
        `"objectOrId" must be either a string, a Pointer or a BaseObject`
      );
    }

    const doc = await this.getOrNull(docId, useMasterKey);

    if (doc) {
      return doc;
    }

    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Document ${docId} not found`);
  }

  public async findBy(
    params: {
      [key: string]: string | boolean | number | Parse.Object | Parse.Pointer;
    },
    useMasterKey: boolean = undefined
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
    useMasterKey: boolean = undefined
  ): Promise<T | undefined> {
    const options = this.prepareOptions({}, useMasterKey);

    for (const [k, v] of Object.entries(params)) {
      this.equalTo(k, v);
    }

    return await this.first(options);
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
    useMasterKey: boolean = undefined,
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

  private prepareOptions(
    options: Parse.FullOptions | undefined,
    useMasterKey: boolean = undefined
  ): Parse.FullOptions {
    if (!options) {
      options = {} as Parse.FullOptions;
    }

    options.sessionToken = this.sessionToken ?? null;

    if (this.masterKey === true) {
      options.useMasterKey = true;
    }

    if (useMasterKey !== undefined) {
      options.useMasterKey = useMasterKey;
    }

    return options;
  }

  public async get(objectId: string, options?: Parse.Query.GetOptions): Promise<T> {
    options = this.prepareOptions(options);

    const obj = await super.get(objectId, options);

    if (obj instanceof SecureObject) {
      await (obj as SecureObject).decrypt();
    }

    return obj;
  }

  private _getResults(objects: T[] | QueryResultWithCount<T>): T[] {
    if (Array.isArray(objects) && !this.useWithCount) {
      return objects;
    }

    // @ts-expect-error missing TS in Parse
    return objects.results;
  }

  private async maybeDecrypt(objs: T[]): Promise<T[]> {
    const queue: Promise<void>[] = [];

    for (const obj of objs) {
      if (obj instanceof SecureObject) {
        queue.push((obj as SecureObject).decrypt());
      }

      // Prepare nested include
      for (const includeName of this.useInclude) {
        const inclObject = ObjectPathUtils.getPathValue(obj, includeName);

        if (inclObject instanceof SecureObject) {
          queue.push(inclObject.decrypt());
        }
      }
    }

    await Promise.all(queue);

    return objs;
  }

  async find(options?: Parse.Query.FindOptions): Promise<T[]> {
    options = this.prepareOptions(options);
    const objects = await super.find(options);

    await this.maybeDecrypt(this._getResults(objects));

    return objects;
  }

  async findWithCount(options?: Parse.Query.FindOptions): Promise<QueryResultWithCount<T>> {
    this.withCount(true);

    const objects = (await super.find(options)) as unknown as QueryResultWithCount<T>;

    await this.maybeDecrypt(this._getResults(objects));

    return objects;
  }
}
