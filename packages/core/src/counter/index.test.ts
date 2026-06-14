import { describe, expect, test } from "#test";
import { Counter } from "./index";

describe(Counter, () => {
  test("increment", () => {
    const counter = new Counter(10);
    const next = counter.next();
    expect(next).toEqual(11);
    expect(counter.current).toEqual(11);
  });

  test("reset", () => {
    const counter = new Counter(1);
    counter.next();
    expect(counter.current).toEqual(2);
    counter.reset();
    expect(counter.current).toEqual(1);
  });
});
