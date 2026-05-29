import { describe, expect, test } from "bun:test";
import { Singleton } from ".";

class TestBlueprint {
  a = "a";
}

const TestSingleton = Singleton(TestBlueprint);

describe("Singleton", () => {
  test("same instance", () => {
    const a1 = TestSingleton.instance;
    const a2 = TestSingleton.instance;
    expect(a1).toStrictEqual(a2);
  });
});
