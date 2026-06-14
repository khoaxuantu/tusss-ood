import { describe, expect, it } from "#test";
import { ErrorBase } from "../error";
import { Result } from "./index";

describe(Result, () => {
  it("should create ok result", () => {
    const result = new Result({ data: 123 });
    expect(result.ok).toBe(true);
    expect(result.data).toBe(123);
    expect(result.error).toBeUndefined();
  });

  it("should create error result", () => {
    const result = new Result({ error: new ErrorBase("test", "error") });
    expect(result.ok).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  describe("toStruct", () => {
    it("should convert ok result to struct", () => {
      const result = new Result({ data: 123 });
      const struct = result.toStruct();
      expect(struct).toMatchObject({
        data: 123,
        ok: true,
      });
    });

    it("should convert error result to struct", () => {
      const result = new Result({ error: new ErrorBase("test", "error") });
      const struct = result.toStruct();
      expect(struct).toMatchObject({
        error: {
          code: "test",
          message: "error",
          name: "ErrorBase",
          stack: expect.any(String),
        },
        ok: false,
      });
    });
  });
});
