import { describe, expect, it } from "#test";
import { ClassProperties } from "../types";
import { Model } from "./index";

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

  describe("toJSON", () => {
    it("should serialize like struct", () => {
      const obj = new TestCls();
      const json = JSON.stringify(obj);

      expect(json).toBe(JSON.stringify(obj.toStruct()));
    });
  });
});
