import { describe, expect, it } from "bun:test";
import { Model } from ".";
import { ClassProperties } from "../types";

class TestCls extends Model<ClassProperties<TestCls>> {
  a = "a";
  b = 1;
  c = false;

  override toStruct(): ClassProperties<TestCls> {
    return { a: this.a, b: this.b, c: this.c };
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
