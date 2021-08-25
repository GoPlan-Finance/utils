import { sleep, processBatch, PromiseWaitAllNested } from '@utils/ProcessUtils';
import exp from 'constants';

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
  });

  describe('PromiseWaitAllNested', function () {
    it('should wait for all to be finished', async () => {
      const t = Date.now();
      const list = [sleep(3), sleep(4), sleep(6)];
      await PromiseWaitAllNested(list);
      expect(Date.now() - t).toBeGreaterThanOrEqual(6);
    });
  });
});
