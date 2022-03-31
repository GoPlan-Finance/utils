// noinspection JSUnusedGlobalSymbols

import { ObjectPathUtils } from './ObjectPathUtils';

type groupByFn<T, K> = (value: T, index: number) => K;

// TS 4.4.0 +
//type groupByResult<T, K extends string | number> = { [key : string | number] : T[] }
type groupByResult<T, K extends string | number> = { [key: string]: T[] };

export class ArrayUtils {
  static randomElement<T>(items: T[]): T {
    if (!items.length) {
      throw new Error('provided array is empty');
    }

    return items[Math.floor(Math.random() * (items.length - 1))];
  }

  static fillWith<T>(length: number, initializer: (index: number) => T): T[] {
    return Array.from({ length }, (_, i) => initializer(i));
  }

  static intersect<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(value => array2.includes(value));
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

  /**
   * Find an array element using filterFn, and move it to finalPosition index.
   * @param original
   * @param finalPosition
   * @param filterFn
   */
  static moveIndex<T>(original: T[], finalPosition: number, filterFn: (a: T) => boolean): T[] {
    const index = original.findIndex(filterFn);

    if (index === -1) {
      return original;
    }

    const tmp = original.splice(index, 1);

    original.splice(finalPosition, 0, ...tmp);

    return original;
  }

  static toKeyValueArray<T, V>(
    objects: T[],
    keyName: keyof T | ((elem: T) => string | number),
    valueKey: keyof T | ((elem: T) => V)
  ): { [key: string]: V } {
    const out: { [key: string]: V } = {};

    for (const object of objects) {
      // noinspection UnnecessaryLocalVariableJS
      let keyVal: string | number = null;
      if (typeof keyName === 'function') {
        keyVal = keyName(object);
      } else {
        keyVal = object[keyName] as unknown as string | number;
      }

      // noinspection UnnecessaryLocalVariableJS
      let value = null;
      if (typeof valueKey === 'function') {
        value = valueKey(object);
      } else {
        value = object[valueKey] as unknown as V;
      }

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

  /**
   * Take an array, compute the values with valueFn() and filter the array by theses values, and retrieve the filtered
   * element and its corresponding calculated value
   *
   * @param elems
   * @param filterFn  Receive two values,  return true if  'a' is preferable than 'b'
   * @param valueFn
   *
   * @example
   * const output = ArrayUtils.filterByvalue(
   *                    [ 1, 5 ,10],
   *                    (a, b ) => a > b,
   *                   elem => elem * 10 + 1 )
   *
   *  console.log(output)
   *  { key : "3" , elem : 10,   val : 101 }
   */
  public static filterByValue<T, V>(
    elems: T[],
    filterFn: (a: V, b: V) => boolean,
    valueFn: (elem: T) => V
  ): { key: string; elem: T; value: V } {
    const keys = Object.keys(elems);
    const values = Object.values(elems);

    if (values.length === 0) {
      return null;
    }

    let index = 0;
    let highestVal: V = undefined;

    for (let i = 0; i < values.length; i++) {
      const val = valueFn(values[i]);

      if (highestVal === undefined || filterFn(val, highestVal)) {
        index = i;
        highestVal = val;
      }
    }

    return {
      key: keys[index],
      elem: values[index],
      value: highestVal,
    };
  }

  public static sum<T>(arr: T[], cb: (item: T) => number): number {
    return arr.reduce((result, current) => result + cb(current), 0);
  }
}
