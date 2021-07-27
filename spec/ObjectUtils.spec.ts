// import { ArrayUtils } from '@utils/ArrayUtils'

import { ArrayUtils } from "@utils/ArrayUtils";
import { ObjectUtils } from "@utils/ObjectUtils";

describe("ObjectUtils", () => {
  describe("findKeyWithHighestValue", () => {
    it("should return the highest value's key", function () {
      const data = {
        a: 1,
        b: 98,
        c: 3,
        d: 99,
      };

      const val = ObjectUtils.findKeyWithHighestValue<number>(data, 2);
      expect(val).toStrictEqual(["d", "b"]);
    });
  });

  describe("intersect", () => {
    it("should return matching elements in two arrays", function () {
      expect(ArrayUtils.intersect([1, 2, 3], [3, 4, 5, 2])).toStrictEqual([2, 3]);
    });
  });
});
