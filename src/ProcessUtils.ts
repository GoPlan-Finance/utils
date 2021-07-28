export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export type StringKeys<T> = Extract<keyof T, string>;

export const processBatch = async <T, U, V extends boolean | number | null | undefined = undefined>(
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

    results.push(result);

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
  while (--nbParallel >= 0) {
    threads.push(runLoop());
  }

  await Promise.all(threads);

  return results;
};

export function PromiseWaitAllNested<T>(promises: Promise<void>[]): Promise<void> {
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
