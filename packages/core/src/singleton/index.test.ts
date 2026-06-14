import { describe, expect, test } from "#test";
import { Singleton } from "./index";

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
