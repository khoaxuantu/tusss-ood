import { describe, expect, it } from "bun:test";
import { Model } from ".";
import { ClassProperties } from "../types";

class SubTestCls extends Model<SubTestCls> {
  b = 2;

  override toStruct(): ClassProperties<SubTestCls> {
    return {
      b: this.b,
    };
  }
}

class TestCls extends Model<TestCls> {
  a = "a";
  b = 1;
  c = false;
  sub = new SubTestCls();

  override toStruct(): ClassProperties<TestCls> {
    return { a: this.a, b: this.b, c: this.c, sub: this.sub.toStruct() };
  }
}

describe("Model", () => {
  describe("toStruct", () => {
    it("should not be a class instance", () => {
      const obj = new TestCls();
      expect(obj.toStruct() instanceof TestCls).toBe(false);
    });
  });
});
