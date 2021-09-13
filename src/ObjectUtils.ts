export class ObjectUtils {
  static sortByKeys<T>(unordered: { [key: string]: T }): { [key: string]: T } {
    return Object.keys(unordered)
      .sort()
      .reduce((obj, key) => {
        // @ts-expect-error implicit any
        obj[key] = unordered[key];
        return obj;
      }, {});
  }

  /**
   *
   * @param unordered
   * @param compareFn   Typically ( a, b ) => a - b
   */
  static sortByValue<T>(
    unordered: { [key: string]: T },
    compareFn: (a: T, b: T) => number
  ): { [key: string]: T } {
    return Object.fromEntries(
      Object.entries(unordered).sort(([, a]: [unknown, T], [, b]: [unknown, T]) => compareFn(a, b))
    );
  }

  public static findKeyWithHighestValue<T>(values: { [key: string]: T }, n: number): string[] {
    return Object.keys(values) // @ts-expect-error  type mismatch
      .sort((a, b) => values[b] - values[a])
      .slice(0, n);
  }

  static getKeyByValue<V, T = unknown, U = string>(object: T, value: U): V {
    // @ts-expect-error any
    return Object.keys(object).find(key => object[key] === value);
  }

  static deepClone<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }

  static deepEquals<T, U>(a: T, b: T): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
