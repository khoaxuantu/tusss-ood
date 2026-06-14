import { describe, expect, it } from "#test";
import { Printer } from "./index";

describe("Printer - class", () => {
  class TestCls extends Printer {
    override toString(): string {
      return "test";
    }
  }

  describe("toString", () => {
    it("should return the string", () => {
      const obj = new TestCls();
      expect(obj.toString()).toBe("test");
    });
  });
});

describe("Printer - plain object", () => {
  const printer = {
    toString: () => "abc",
  } satisfies Printer;

  describe("toString", () => {
    it("should return the string", () => {
      expect(printer.toString()).toBe("abc");
    });
  });
});
