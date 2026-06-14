import { describe, expect, it } from "#test";
import { ErrorBase } from "./index";

describe(ErrorBase, () => {
  it("should create an ErrorBase instance", () => {
    const error = new ErrorBase("code", "message");
    expect(error).toBeInstanceOf(ErrorBase);
    expect(error.code).toBe("code");
    expect(error.message).toBe("message");
    expect(error.name).toBe("ErrorBase");
    expect(Error.isError(error)).toBe(true);
  });

  describe("toStruct", () => {
    it("should convert ErrorBase to struct", () => {
      const error = new ErrorBase("code", "message", { cause: "test" });
      const struct = error.toStruct();

      expect(struct).toEqual({
        code: "code",
        message: "message",
        name: "ErrorBase",
        cause: "test",
        stack: expect.any(String),
      });
    });
  });
});
