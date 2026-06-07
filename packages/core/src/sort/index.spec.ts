import { describe, expect, it } from "bun:test";
import { Sort } from ".";

describe(Sort, () => {
  it("should create a default sort", () => {
    const sort = new Sort();
    expect(sort).toEqual({ field: "id", direction: "asc" });
  });
});
