import { StringUtils } from "@utils/StringUtils";

describe("StringUtils", () => {
  describe("properCase", () => {
    it("should return a formatted Proper Case Sentence", function () {
      const val = StringUtils.properCase("this is a sentence");
      expect(val).toStrictEqual("This Is A Sentence");

      const val2 = StringUtils.properCase("this-is-a-sentence with some dashes");
      expect(val2).toStrictEqual("This-Is-A-Sentence With Some Dashes");
    });

    it("should handle empty strings and invalid inputs", function () {
      const val = StringUtils.properCase("");
      expect(val).toStrictEqual("");

      const val2 = StringUtils.properCase(null);
      expect(val2).toStrictEqual(null);

      const val3 = StringUtils.properCase(undefined);
      expect(val3).toStrictEqual(undefined);
    });

    it("should leave non-alpha chars untoutched", function () {
      const val = StringUtils.properCase("!@#$@%^#^%& abc *$^&(* $!@#%$ !^%!$#^ !#$^{}{|}?> dEF");
      expect(val).toStrictEqual("!@#$@%^#^%& Abc *$^&(* $!@#%$ !^%!$#^ !#$^{}{|}?> Def");

      const val2 = StringUtils.properCase(
        "abc                                  def                      "
      );
      expect(val2).toStrictEqual("Abc                                  Def                      ");
    });
  }); // properCase
});
