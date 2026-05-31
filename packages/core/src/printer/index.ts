/**
 * Abstract base class representing a component capable of producing a string representation of itself.
 *
 * Subclasses or implementations should override or define the {@link toString} method
 * to generate the appropriate string formatting.
 *
 * @example
 * Example demonstrating implementing a custom Printer class and defining a plain object conforming to Printer
 * ```ts
 * // 1. Implementing as a class
 * class CustomPrinter extends Printer {
 *   override toString(): string {
 *     return "Hello from CustomPrinter";
 *   }
 * }
 *
 * const printerObj = new CustomPrinter();
 * console.log(printerObj.toString()); // "Hello from CustomPrinter"
 *
 * // 2. Conforming as a plain object
 * const plainPrinter = {
 *   toString: () => "Hello from plain object",
 * } satisfies Printer;
 *
 * console.log(plainPrinter.toString()); // "Hello from plain object"
 * ```
 */
export abstract class Printer {
  /**
   * Generates a string representation of the printer or its target content.
   *
   * @returns A string representation.
   */
  abstract toString(): string;
}

