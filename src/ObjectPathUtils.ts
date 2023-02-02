/**
 *
 */

export class ObjectPathUtils {
  static setPathValue<T, U>(obj: T, path: string | string[], value: U): void {
    const a = Array.isArray(path) ? path : path.split('.');
    let o: unknown = obj;
    while (a.length - 1) {
      const n = a.shift();
      if (n && !(n in (o as object))) {
        // @ts-expect-error implicit any
        (o as object)[n] = {};
      }
      // @ts-expect-error implicit any
      o = o[n];
    }
    // @ts-expect-error implicit any
    (o as object)[a[0]] = value;
  }

  static getPathValue<U, T = unknown>(obj: T, path: string | string[], defaultVal?: U): U {
    let a: string[] = [];

    if (Array.isArray(path)) {
      a = path;
    } else {
      path = path.replace(/\[(\w+)\]/g, '.$1');
      path = path.replace(/^\./, '');
      a = path.split('.');
    }

    let o: unknown = obj;
    while (a.length) {
      const n = a.shift();
      if (n && !(n in (o as object))) {
        return defaultVal;
      }
      // @ts-expect-error implicit any
      o = (o as object)[n];
    }
    return o as U;
  }
}
