import { ClassProperties } from "../types";

export interface IModel<TData> {
  /**
   * Converts the model instance into a plain data structure (struct).
   *
   * This method extracts the model's property data, removing functions, methods,
   * or class-specific instance details, returning a clean structural representation.
   *
   * @returns A plain object structure containing the model's serializable properties.
   */
  toStruct(): ClassProperties<TData>;

  /**
   * Implements the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify | JSON.stringify()} behavior.
   *
   * It uses {@link toStruct} to get the plain object structure under the hood.
   *
   * It is encouraged to use {@link toStruct} instead of this method because it provides better
   * clarity and expressiveness about the data structure being serialized. This method is provided
   * only to support the `JSON.stringify()` serialization.
   *
   * @returns A plain object structure containing the model's serializable properties.
   */
  toJSON(): ClassProperties<TData>;
}

/**
 * Abstract base class representing a domain model in the application.
 *
 * Models package data and behaviors, and provide a standard interface for
 * serialization or conversion into a plain data structure through {@link toStruct}.
 *
 * @template TData The type representation of the model's data shape.
 *
 * @example
 * Example demonstrating converting a model with nested sub-models to a plain struct
 * ```ts
 * class SubModel extends Model<SubModel> {
 *   value = 42;
 *
 *   override toStruct(): ClassProperties<SubModel> {
 *     return {
 *       value: this.value,
 *     };
 *   }
 * }
 *
 * class User extends Model<User> {
 *   name = "Alice";
 *   sub = new SubModel();
 *
 *   override toStruct(): ClassProperties<User> {
 *     return {
 *       name: this.name,
 *       sub: this.sub.toStruct(),
 *     };
 *   }
 * }
 *
 * const user = new User();
 * const struct = user.toStruct(); // { name: "Alice", sub: { value: 42 } }
 * ```
 */
export abstract class Model<TData> implements IModel<TData> {
  abstract toStruct(): ClassProperties<TData>;

  toJSON(): ClassProperties<TData> {
    return this.toStruct();
  }
}
