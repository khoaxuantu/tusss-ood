import { expect as denoExpect, fn as denoFn } from "@std/expect";
import { describe as denoDescribe, it as denoIt } from "node:test";

export function describe(name: any, fn: () => void) {
  const nameStr = typeof name === "function" ? name.name || name.toString() : String(name);
  return denoDescribe(nameStr, fn);
}

export const it = denoIt;
export const test = denoIt;
export const expect = denoExpect;
export function mock(impl?: (...args: any[]) => any) {
  const fn = impl ?? (() => {});

  return denoFn(fn);
}
