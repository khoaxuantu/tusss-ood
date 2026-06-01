/**
 * Primitive type
 *
 * @internal
 */
export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null
  | Date
  | RegExp;

/**
 * Type helper to extract all properties of a class, excluding methods and functions.
 *
 * @example
 * Example demonstrating extracting properties of a class
 * ```ts
 * class User {
 *   name = "Alice";
 *   age = 25;
 *
 *   greet() {
 *     console.log(`Hello, my name is ${this.name}`);
 *   }
 * }
 *
 * // { name: string; age: number }
 * type UserProps = ClassProperties<User>;
 * ```
 */
export type ClassProperties<C> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof C as C[K] extends Function ? never : K]: NonNullable<C[K]> extends Array<infer U>
    ? Array<ClassProperties<U>>
    : NonNullable<C[K]> extends Map<any, infer V>
      ? Array<[string, ClassProperties<V>]>
      : NonNullable<C[K]> extends object
        ? NonNullable<C[K]> extends Primitive
          ? C[K]
          : ClassProperties<NonNullable<C[K]>>
        : C[K];
};

/**
 * Type helper representing the constructor of a class, typically used to denote a class type.
 *
 * @template T The type of the class instance.
 */
export type Constructor<T = any> = {
  new (...args: any[]): T;
};

/**
 * Type helper to allow a string literal to be used as a key or a regular string. By setting this
 * type, you can benefit from LSP's autocompletion feature, as well as type checking.
 */
export type KeyOrString<T extends string> = T | (string & {});

/**
 * Type helper representing the type of application's environment.
 */
export type EnvironmentType = KeyOrString<"development" | "test" | "staging" | "production">;
