/**
 * Configuration options for creating a {@link BatchExecutor}.
 *
 * @template TOps - The type of individual operations in the batch.
 */
export interface BatchExecutorOptions<TOps> {
  /**
   * The maximum number of operations that can be held in a batch.
   *
   * @default 100
   */
  capacity?: number;

  /**
   * The name identifying this batch executor instance.
   *
   * @default "batch-executor"
   */
  name?: string;

  /**
   * The callback function that processes a batch of operations.
   *
   * @param ops - An array of queued operations to execute.
   * @returns A promise that resolves when execution is complete.
   */
  execute: (ops: TOps[]) => Promise<void>;
}

/**
 * A utility class to queue operations and execute them in batches.
 *
 * @template TOps - The type of individual operations/items processed by the executor.
 *
 * @example
 * Executing operations in batches of a specified capacity and flushing remaining items:
 * ```ts
 * const executor = new BatchExecutor<number>({
 *   capacity: 3,
 *   execute: async (batch) => {
 *     console.log("Executing batch:", batch);
 *   }
 * });
 *
 * executor.add(1);
 * executor.add(2);
 * executor.add(3);
 *
 * if (executor.isFull) {
 *   await executor.execAndFlush(); // Logs: Executing batch: [1, 2, 3]
 * }
 *
 * executor.add(4);
 * if (!executor.isEmpty) {
 *   await executor.execAndFlush(); // Logs: Executing batch: [4]
 * }
 * ```
 */
export class BatchExecutor<TOps> {
  private ops: TOps[];
  private execute: (ops: TOps[]) => Promise<void>;

  /**
   * The maximum number of operations that can be held in a batch before it is considered full.
   *
   * @default 100
   */
  readonly capacity: number;

  /**
   * The name identifying this batch executor instance.
   *
   * @default "batch-executor"
   */
  readonly name: string;

  /**
   * Initializes a new instance of the BatchExecutor class.
   *
   * @param options - Configuration options including capacity, name, and the batch execution function.
   */
  constructor(options: BatchExecutorOptions<TOps>) {
    this.capacity = options.capacity ?? 100;
    this.name = options.name ?? "batch-executor";
    this.ops = [];
    this.execute = options.execute;
  }

  /**
   * Gets the current number of queued operations in the batch.
   */
  get size() {
    return this.ops.length;
  }

  /**
   * Checks whether the batch size has reached or exceeded the configured capacity.
   */
  get isFull() {
    return this.size >= this.capacity;
  }

  /**
   * Checks whether there are no operations currently queued in the batch.
   */
  get isEmpty() {
    return !this.size;
  }

  /**
   * Adds an operation to the batch.
   *
   * @param op - The operation or item to add.
   */
  add(op: TOps) {
    this.ops.push(op);
  }

  /**
   * Triggers the execution of all currently queued operations and then clears the batch.
   *
   * @returns A promise that resolves when the execution is complete.
   */
  async execAndFlush() {
    await this.execute(this.ops);
    this.ops = [];
  }
}
