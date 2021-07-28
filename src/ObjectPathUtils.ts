/**
 *
 */

export class ObjectPathUtils {
  static setPathValue<T, U>(obj: T, path: string | string[], value: U): void {
    const a = Array.isArray(path) ? path : path.split('.');
    let o = obj;
    while (a.length - 1) {
      const n = a.shift();
      if (!(n in o)) {
        // @ts-expect-error implicit any
        o[n] = {};
      }
      // @ts-expect-error implicit any
      o = o[n];
    }
    // @ts-expect-error implicit any
    o[a[0]] = value;
  }

  static getPathValue<U, T = unknown>(
    obj: T,
    path: string | string[],
    defaultVal: U = undefined
  ): U {
    let a = [];

    if (Array.isArray(path)) {
      a = path;
    } else {
      path = path.replace(/\[(\w+)\]/g, '.$1');
      path = path.replace(/^\./, '');
      a = path.split('.');
    }

    let o = obj;
    while (a.length) {
      const n = a.shift();
      if (!(n in o)) {
        return defaultVal;
      }
      // @ts-expect-error implicit any
      o = o[n];
    }
    // @ts-expect-error implicit any
    return o;
  }
}
