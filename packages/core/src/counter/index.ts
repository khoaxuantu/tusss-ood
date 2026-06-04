/**
 * A utility class representing a counter that can be incremented and reset.
 *
 * The Counter class provides a simple mechanism to maintain an incremental state,
 * beginning from an optional initial value (defaults to 0).
 *
 * @example
 * Basic usage showing initialization, incrementing, and resetting:
 * ```ts
 * const counter = new Counter(10);
 * console.log(counter.current); // 10
 *
 * counter.next(); // 11
 * console.log(counter.current); // 11
 *
 * counter.reset();
 * console.log(counter.current); // 10
 * ```
 */
export class Counter {
  private initialValue: number;
  private counter: number;

  /**
   * Initializes a new instance of the Counter class.
   *
   * @param initialValue - The starting value of the counter. Defaults to 0.
   */
  constructor(initialValue: number = 0) {
    this.initialValue = initialValue;
    this.counter = initialValue;
  }

  /**
   * Gets the current value of the counter.
   */
  get current(): number {
    return this.counter;
  }

  /**
   * Increments the counter and returns the new value.
   *
   * @returns The updated counter value.
   */
  next(): number {
    this.counter++;
    return this.counter;
  }

  /**
   * Resets the counter back to its initial value.
   */
  reset(): void {
    this.counter = this.initialValue;
  }
}

