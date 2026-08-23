/**
 * A utility class for handling decimal precision arithmetic.
 *
 * This helper offers more accurate results for rounding, ceiling, flooring,
 * truncation, and fixed-point representation than standard JavaScript `Math`
 * functions, which can suffer from binary floating-point precision issues.
 *
 * @see {@link https://stackoverflow.com/a/48764436 | Stack Overflow reference - Solution 2}
 *
 * @example
 * Basic usage of DecimalPrecision methods
 * ```ts
 * import { DecimalPrecision } from './decimal-precision';
 *
 * // Rounding
 * DecimalPrecision.round(1.005, 2); // 1.01
 * DecimalPrecision.round(1262.48, -1); // 1260
 *
 * // Ceiling
 * DecimalPrecision.ceil(5.12, 1); // 5.2
 *
 * // Flooring
 * DecimalPrecision.floor(5.12, 1); // 5.1
 *
 * // Truncating
 * DecimalPrecision.trunc(-5.12, 1); // -5.1
 *
 * // Format to fixed string
 * DecimalPrecision.toFixed(1.005, 2); // "1.01"
 * ```
 */
export class DecimalPrecision {
  /**
   * Rounds a number to a specified number of decimal places.
   *
   * @param num - The number to round.
   * @param decimalPlaces - The number of decimal places to round to. Defaults to 0. Can be negative to round to tens, hundreds, etc.
   * @returns The rounded number.
   */
  static round(num: number, decimalPlaces: number = 0) {
    const p = Math.pow(10, decimalPlaces);
    const n = num * p * (1 + Number.EPSILON);
    return Math.round(n) / p;
  }

  /**
   * Computes the smallest integer greater than or equal to a number, resolved to a specified number of decimal places.
   *
   * @param num - The number to evaluate.
   * @param decimalPlaces - The number of decimal places to resolve to. Defaults to 0.
   * @returns The ceiling value of the number resolved to the specified decimal places.
   */
  static ceil(num: number, decimalPlaces: number = 0) {
    const p = Math.pow(10, decimalPlaces);
    const n = num * p * (1 - Math.sign(num) * Number.EPSILON);
    return Math.ceil(n) / p;
  }

  /**
   * Computes the largest integer less than or equal to a number, resolved to a specified number of decimal places.
   *
   * @param num - The number to evaluate.
   * @param decimalPlaces - The number of decimal places to resolve to.
   * @returns The floored value of the number resolved to the specified decimal places.
   */
  static floor(num: number, decimalPlaces: number) {
    const p = Math.pow(10, decimalPlaces);
    const n = num * p * (1 + Math.sign(num) * Number.EPSILON);
    return Math.floor(n) / p;
  }

  /**
   * Truncates a number to a specified number of decimal places, removing any fractional digits beyond that precision.
   *
   * @param num - The number to truncate.
   * @param decimalPlaces - The number of decimal places to truncate to.
   * @returns The truncated number.
   */
  static trunc(num: number, decimalPlaces: number) {
    return (num < 0 ? this.ceil : this.floor)(num, decimalPlaces);
  }

  /**
   * Formats a number using fixed-point notation with accurate rounding.
   *
   * @param num - The number to format.
   * @param decimalPlaces - The number of digits to appear after the decimal point.
   * @returns A string representation of the number in fixed-point notation.
   */
  static toFixed(num: number, decimalPlaces: number) {
    return this.round(num, decimalPlaces).toFixed(decimalPlaces);
  }
}
