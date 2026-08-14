import { MathUtils } from './MathUtils';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export type StringKeys<T> = Extract<keyof T, string>;

/**
 * Run `func` over `data` with at most `nbParallel` concurrent executions.
 *
 * Result contract:
 * - The returned array is aligned with the input: `results[i]` is the outcome of `data[i]`,
 *   regardless of the order in which the individual promises settle.
 * - Errors are captured, not thrown: if `func` rejects for an element, the rejection reason
 *   (typically an `Error`) is logged and stored as that element's result. Callers that need to
 *   distinguish failures should check for `Error` instances in the returned array.
 * - If `statusFunc` returns `false`, no new work is started; elements not yet processed are left
 *   as empty slots in the returned array.
 */
export const processBatch = async <
  T,
  U,
  V extends boolean | number | null | undefined | void = void,
>(
  data: Array<T>,
  func: (elem: T) => Promise<U>,
  statusFunc: (curIndex?: number, len?: number, result?: U) => Promise<V> | V,
  nbParallel = 8
): Promise<U[]> => {
  const results: Array<U> = [];
  let index = 0;
  let iCompleted = 0;
  let abortAll = false;

  const runOne = async (curIndex: number): Promise<void> => {
    let result: U = null;
    try {
      result = await func(data[curIndex]);
    } catch (error) {
      console.error(error);
      result = error;
    }
    const statusResult = statusFunc ? await statusFunc(curIndex, data.length, result) : true;

    if (statusResult === false) {
      console.warn('Abort "signal" received');
      abortAll = true;
    }

    results[curIndex] = result;

    ++iCompleted;
  };

  const runLoop = async (): Promise<void> => {
    while (!abortAll && iCompleted < data.length && index < data.length) {
      const curIndex = index++;

      await sleep(0);
      await runOne(curIndex);
    }
  };

  // start first iteration
  const threads: Promise<void>[] = [];

  // Do not start more threads that length of data.
  let startQty = MathUtils.between(nbParallel, 0, data.length);

  while (--startQty >= 0) {
    threads.push(runLoop());
  }

  await Promise.all(threads);

  return results;
};

export function PromiseWaitAllNested<T>(promises: Promise<T>[]): Promise<void> {
  const waitForRequests = () =>
    new Promise<void>((resolve): void => {
      const len = promises.length;

      Promise.all(promises).then(() => {
        if (len !== promises.length) {
          waitForRequests().then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });

  return waitForRequests();
}
