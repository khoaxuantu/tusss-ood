import { DecimalPrecision } from "../decimal-precision";
import { Printer } from "../printer";

/**
 * A stopwatch utility that tracks and formats elapsed execution time.
 */
export class TimerStopwatch implements Printer {
  private lastLapse: number;
  private precision: number;

  /**
   * Initializes a new TimerStopwatch with a starting timestamp.
   *
   * @param start - The starting timestamp in milliseconds (e.g. from `performance.now()`).
   * @param opt - Options for the stopwatch.
   * - `precision`: The number of decimal places to use for the elapsed time. Default is 2.
   */
  constructor(
    private readonly start: number,
    opt?: { precision?: number },
  ) {
    this.lastLapse = 0;
    this.precision = opt?.precision ?? 2;
  }

  /**
   * Gets the elapsed time recorded during the last call to {@link elapse}, in milliseconds.
   */
  get lapseMs() {
    return this.lastLapse;
  }

  /**
   * Calculates and records the elapsed time since the stopwatch was created.
   *
   * @returns The elapsed time in milliseconds.
   */
  elapse() {
    this.lastLapse = performance.now() - this.start;
    return this.lastLapse;
  }

  /**
   * Formats the last recorded elapsed time into a human-readable string (`ms` or `s`).
   *
   * @returns A string representation of the elapsed time (e.g., `"50ms"` or `"2.12s"`).
   */
  toString(): string {
    if (this.lapseMs <= 1000) return `${DecimalPrecision.round(this.lapseMs, this.precision)}ms`;
    return `${DecimalPrecision.round(this.lapseMs / 1000, this.precision)}s`;
  }
}

/**
 * Utility providing timing functions.
 *
 * @example
 * Measuring elapsed time using stopwatch and delaying execution with delay:
 * ```ts
 * const sw = Timer.stopwatch();
 *
 * await Timer.delay(100);
 * sw.elapse();
 *
 * console.log(sw.lapseMs); // e.g. 100.25
 * console.log(sw.toString()); // "100.25ms"
 * ```
 */
export const Timer = {
  /**
   * Creates and starts a new stopwatch initialized with the current timestamp.
   *
   * @param opt - Options for the stopwatch.
   * - `precision`: The number of decimal places to use for the elapsed time. Default is 2.
   *
   * @returns A new {@link TimerStopwatch} instance.
   */
  stopwatch: (opt?: { precision?: number }) => {
    const start = performance.now();
    return new TimerStopwatch(start, opt);
  },

  /**
   * Asynchronously pauses execution for a specified duration.
   *
   * @param ms - The duration to pause in milliseconds.
   * @returns A promise that resolves after the specified duration.
   */
  delay: (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
} as const;
