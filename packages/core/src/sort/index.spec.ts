import { describe, expect, it } from "#test";
import { Sort } from "./index";

describe(Sort, () => {
  it("should create a default sort", () => {
    const sort = new Sort();
    expect(sort).toEqual({ field: "id", direction: "asc" });
  });
});
