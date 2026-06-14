import {
  vi,
  describe as vitestDescribe,
  expect as vitestExpect,
  it as vitestIt,
  test as vitestTest,
} from "vitest";

export function describe(name: any, fn: () => void) {
  const nameStr = typeof name === "function" ? name.name || name.toString() : String(name);
  return vitestDescribe(nameStr, fn);
}

export const it = vitestIt;
export const test = vitestTest;
export const expect = vitestExpect;
export const mock: typeof vi.fn = vi.fn;
