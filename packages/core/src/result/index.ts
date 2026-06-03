import { ErrorBase } from "../error";
import { Model } from "../model";
import { ClassProperties } from "../types";

/**
 * Represents the outcome of an operation, which can be either a success containing data
 * or a failure containing an error.
 *
 * @template T The type of the data returned in a successful result. Defaults to `never`.
 *
 * @example
 * Example demonstrating creating and serializing successful and failed results
 * ```ts
 * // 1. Successful result
 * const success = new Result({ data: "Hello World" });
 * console.log(success.ok); // true
 * console.log(success.data); // "Hello World"
 * console.log(success.toStruct()); // { data: "Hello World", ok: true }
 *
 * // 2. Failed result
 * const failure = new Result({ error: new ErrorBase("NOT_FOUND", "User not found") });
 * console.log(failure.ok); // false
 * console.log(failure.error?.message); // "User not found"
 * ```
 */
export class Result<T = never> extends Model<Result<T>> {
  /**
   * The data payload of a successful result.
   */
  data: T;

  /**
   * The error object of a failed result.
   */
  error?: ErrorBase;

  /**
   * Creates a new Result instance.
   *
   * @param props The initialization properties.
   * @param props.data The data payload.
   * @param props.error The error payload.
   */
  constructor(props: { data?: T; error?: Result["error"] }) {
    super();
    this.data = props.data as T;
    this.error = props.error;
  }

  /**
   * Indicates whether the result represents a successful operation.
   *
   * @returns `true` if there is no error; otherwise `false`.
   */
  get ok() {
    return !this.error;
  }

  /**
   * Converts the result instance into a plain data structure (struct).
   *
   * @returns A plain object structure containing the result properties.
   */
  toStruct(): ClassProperties<Result<T>> {
    return {
      data: this.data,
      error: this.error?.toStruct(),
      ok: this.ok,
    } as ClassProperties<Result<T>>;
  }
}
