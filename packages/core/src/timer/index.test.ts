import { describe, expect, it } from "#test";
import { Timer } from "./index";

describe("Timer", () => {
  describe("stopwatch", () => {
    it("should return elapsed time in milliseconds", () => {
      const sw = Timer.stopwatch();
      const elapsed = sw.elapse();
      expect(typeof elapsed).toBe("number");
    });

    it("should print ms if time <= 1000ms", async () => {
      const sw = Timer.stopwatch();
      await Timer.delay(50);
      sw.elapse();
      expect(sw.lapseMs).toBeGreaterThan(45);
      expect(sw.toString()).toContain("ms");
    });

    it("should print s if last lapse > 1000ms", () => {
      const sw = Timer.stopwatch();
      sw["lastLapse"] = 2123;
      expect(sw.toString()).toEqual("2.12s");
    });
  });
});
