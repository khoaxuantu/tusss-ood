import { Constructor } from "../types";

/**
 * A class decorator / mixin function that implements the Singleton design pattern.
 *
 * It wraps the provided class constructor and returns a subclass that contains a static
 * `instance` property, guaranteeing that only one instance of the class will be created and shared.
 *
 * @template T The constructor function type of the class to be turned into a Singleton.
 * @param cls The class constructor function.
 * @returns A subclass extending the input class, equipped with a static `instance` getter.
 *
 * @example
 * Example demonstrating wrapping a class with Singleton and accessing its shared instance
 * ```ts
 * class DatabaseConnection {
 *   connect() {
 *     console.log("Connected to DB");
 *   }
 * }
 *
 * const DbSingleton = Singleton(DatabaseConnection);
 *
 * // Accessing the shared instance
 * const db1 = DbSingleton.instance;
 * const db2 = DbSingleton.instance;
 *
 * console.log(db1 === db2); // true
 * ```
 */
export function Singleton<T extends Constructor>(cls: T) {
  let _instance: InstanceType<T>;

  class MixinClass extends cls {
    /**
     * Gets the shared, lazily-instantiated instance of the class.
     *
     * @returns The single instance of type `InstanceType<T>`.
     */
    static get instance(): InstanceType<T> {
      if (!_instance) _instance = new cls();
      return _instance;
    }
  }

  return MixinClass;
}
