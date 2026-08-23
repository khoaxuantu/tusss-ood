import { describe, expect, test } from "#test";
import { DecimalPrecision } from "./index";

describe("CalcHelper", () => {
  describe(DecimalPrecision.name, () => {
    describe("round", () => {
      test("rounding of half", () => {
        expect(DecimalPrecision.round(0.5)).toEqual(1);
        expect(DecimalPrecision.round(-0.5)).toEqual(-1);
      });

      test("simple cases", () => {
        expect(DecimalPrecision.round(5.12, 1)).toEqual(5.1);
        expect(DecimalPrecision.round(-5.12, 1)).toEqual(-5.1);
      });

      test("edge cases", () => {
        expect(DecimalPrecision.round(1.005, 2)).toEqual(1.01);
        expect(DecimalPrecision.round(39.425, 2)).toEqual(39.43);
        expect(DecimalPrecision.round(-1.005, 2)).toEqual(-1.01);
        expect(DecimalPrecision.round(-39.425, 2)).toEqual(-39.43);
      });

      test("to tens and hundreds", () => {
        expect(DecimalPrecision.round(1262.48, -1)).toEqual(1260);
        expect(DecimalPrecision.round(1262.48, -2)).toEqual(1300);
      });
    });

    describe("ceil", () => {
      test("very small numbers", () => {
        expect(DecimalPrecision.ceil(1e-8, 2)).toEqual(0.01);
      });

      test("simple cases", () => {
        expect(DecimalPrecision.ceil(5.12, 1)).toEqual(5.2);
        expect(DecimalPrecision.ceil(-5.12, 1)).toEqual(-5.1);
      });

      test("edge cases", () => {
        const testNums = [9.13, 65.18, -2.26, -18.15];
        const expectNums = [9.13, 65.18, -2.26, -18.15];
        testNums.forEach((num, index) =>
          expect(DecimalPrecision.ceil(num, 2)).toEqual(expectNums[index]),
        );
      });
    });

    describe("floor", () => {
      test("very small numbers", () => {
        expect(DecimalPrecision.floor(1e-8, 2)).toEqual(0);
      });

      test("simple cases", () => {
        expect(DecimalPrecision.floor(5.12, 1)).toEqual(5.1);
        expect(DecimalPrecision.floor(-5.12, 1)).toEqual(-5.2);
      });

      test("edge cases", () => {
        const testNums = [2.26, 18.15, -9.13, -65.18];
        const expectNums = [2.26, 18.15, -9.13, -65.18];
        testNums.forEach((num, index) =>
          expect(DecimalPrecision.floor(num, 2)).toEqual(expectNums[index]),
        );
      });
    });

    describe("trunc", () => {
      test("simple cases", () => {
        expect(DecimalPrecision.trunc(5.12, 1)).toEqual(5.1);
        expect(DecimalPrecision.trunc(-5.12, 1)).toEqual(-5.1);
      });

      test("edge cases", () => {
        const testNums = [2.26, 18.15, -2.26, -18.15];
        const expectNums = [2.26, 18.15, -2.26, -18.15];
        testNums.forEach((num, index) =>
          expect(DecimalPrecision.trunc(num, 2)).toEqual(expectNums[index]),
        );
      });
    });

    describe("toFixed", () => {
      test("simple cases", () => {
        expect(DecimalPrecision.toFixed(1.005, 2)).toEqual("1.01");
      });
    });
  });
});
