import { describe, expect, mock, test } from "#test";
import { BatchExecutor } from "./index";

describe("BatchExecutor", () => {
  test("should execute by batch", async () => {
    const fn = mock(() => {});
    const batchSize = 5;
    const count = 11;
    const expectExecTimes = Math.ceil(count / batchSize);
    const batch = new BatchExecutor({ capacity: batchSize, execute: async () => fn() });

    for (let i = 0; i < count; i++) {
      batch.add(i);
      if (batch.isFull) await batch.execAndFlush();
    }

    if (!batch.isEmpty) await batch.execAndFlush();

    expect(fn).toHaveBeenCalledTimes(expectExecTimes);
  });
});
