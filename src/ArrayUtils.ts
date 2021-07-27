// noinspection JSUnusedGlobalSymbols

import { ObjectPathUtils } from "@utils/ObjectPathUtils";

type groupByFn<T, K> = (value: T, index: number) => K;

// TS 4.4.0 +
//type groupByResult<T, K extends string | number> = { [key : string | number] : T[] }
type groupByResult<T, K extends string | number> = { [key: string]: T[] };

export class ArrayUtils {
  static randomElement<T>(items: T[]): T {
    if (!items.length) {
      throw new Error("provided array is empty");
    }

    return items[Math.floor(Math.random() * (items.length - 1))];
  }

  static intersect<T>(array1: T[], array2: T[]): T[] {
    return array1.filter((value) => array2.includes(value));
  }

  static shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      const temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  public static groupBy<T, K extends string | number>(
    array: T[],
    keyCb: groupByFn<T, K>
  ): groupByResult<T, K> {
    return array.reduce((result: groupByResult<T, K>, currentValue, index) => {
      const key: K = keyCb(currentValue as T, index);

      result[key] = result[key] || [];

      result[key].push(currentValue);
      return result;
    }, {});
  }

  public static batches<T>(array: T[], perChunk: number): T[][] {
    return Object.values(
      ArrayUtils.groupBy<T, string>(array, (value, index) => {
        return Math.floor(index / perChunk).toString();
      })
    );
  }

  public static unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  public static uniqueByKey<T, V = string>(arr: T[], key: keyof T): T[] {
    const out = [];
    const keys: V[] = [];

    for (const item of arr) {
      const kVal = item[key] as unknown as V;

      if (!keys.includes(kVal)) {
        out.push(item);
        keys.push(kVal);
      }
    }

    return out;
  }

  public static sortByKey<T>(arr: T[], propPath: string, ascending = true): T[] {
    const order = ascending ? 1 : -1;

    return arr.sort((a, b) => {
      return ObjectPathUtils.getPathValue(a, propPath) > ObjectPathUtils.getPathValue(b, propPath)
        ? order * 1
        : order * -1;
    });
  }

  static toKeyValueArray<T, V>(
    objects: T[],
    key: keyof T,
    valueKey: keyof T
  ): { [key: string]: V } {
    const out: { [key: string]: V } = {};

    for (const object of objects) {
      const keyVal = object[key] as unknown as string;
      // noinspection UnnecessaryLocalVariableJS
      const value = object[valueKey] as unknown as V;

      out[keyVal] = value;
    }

    return out;
  }

  static toKeyArray<T>(objects: T[], key: keyof T): { [key: string]: T } {
    const out: { [key: string]: T } = {};

    for (const object of objects) {
      const keyVal = object[key] as unknown as string;

      out[keyVal] = object;
    }

    return out;
  }
}
