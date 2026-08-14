import { processBatch, PromiseWaitAllNested, sleep } from '@utils/ProcessUtils';

describe('ProcessUtils', function () {
  describe('sleep', function () {
    it('should wait 3ms', async () => {
      const t = Date.now();
      await sleep(4);
      expect(Date.now() - t).toBeGreaterThanOrEqual(3);
    });
  });

  describe('processBatch', function () {
    it('should loop over all if no error', async () => {
      const worker = async (data: number): Promise<number> => {
        return 1;
      };
      const status = async (curIndex: number, length: number, result: number): Promise<boolean> => {
        return true;
      };
      const list: number[] = [0, 1, 2, 3, 4];
      const results: number[] = await processBatch(list, worker, status);
      expect(results[0]).toBe(1);
    });
    it('should abort if status is false', async () => {
      let i = 1;
      const worker = async (data: number): Promise<number> => {
        return 1;
      };
      const status = async (curIndex: number, length: number, result: number): Promise<boolean> => {
        i++;
        return i <= 2;
      };
      const list: number[] = [0, 1, 2, 3, 4, 5, 6];
      const results: number[] = await processBatch(list, worker, status, 2);
      expect(results.length).toBe(3);
    });

    it('should return results aligned with input order regardless of completion order', async () => {
      // Larger inputs finish later, so completion order differs from input order.
      const delays = [30, 5, 20, 1, 15];
      const worker = async (ms: number): Promise<number> => {
        await sleep(ms);
        return ms;
      };

      const results = await processBatch(delays, worker, null, 8);

      expect(results).toStrictEqual(delays);
    });

    it('should capture a thrown error as that element result instead of rejecting', async () => {
      const worker = async (n: number): Promise<number> => {
        if (n === 1) {
          throw new Error('boom');
        }
        return n;
      };

      const results = await processBatch([0, 1, 2], worker, null, 8);

      expect(results[0]).toBe(0);
      expect(results[1]).toBeInstanceOf(Error);
      expect((results[1] as unknown as Error).message).toBe('boom');
      expect(results[2]).toBe(2);
    });
  });

  describe('PromiseWaitAllNested', function () {
    it('should wait for all to be finished', async () => {
      const mock = jest.fn();

      const list = [
        new Promise<void>(async resolve => {
          mock();
          await sleep(100);
          mock();
          resolve();
        }),

        new Promise<void>(async resolve => {
          mock();
          await sleep(200);
          mock();
          resolve();
        }),

        new Promise<void>(async resolve => {
          mock();
          await sleep(300);
          mock();
          resolve();
        }),
      ];

      await PromiseWaitAllNested<void>(list);
      expect(mock).toHaveBeenCalledTimes(6);
    });

    it('should wait for all nested/recurring promises to be finished', async () => {
      const t = Date.now();
      const mock = jest.fn();

      const list = [
        new Promise<void>(async resolve => {
          await sleep(100);
          mock();

          list.push(
            new Promise<void>(async resolve => {
              await sleep(300);
              mock();

              list.push(
                new Promise<void>(async resolve => {
                  await sleep(300);
                  mock();
                  resolve();
                })
              );
              resolve();
            })
          );

          resolve();
        }),

        new Promise<void>(async resolve => {
          await sleep(200);
          mock();
          resolve();
        }),
      ];

      await PromiseWaitAllNested<void>(list);
      expect(mock).toHaveBeenCalledTimes(4);
    });
  });
});
