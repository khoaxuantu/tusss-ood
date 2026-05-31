/**
 * An abstract base class implementing the Builder design pattern.
 *
 * The Builder pattern is a creational design pattern that lets you construct
 * complex objects step-by-step. The pattern allows you to produce different types
 * and representations of an object using the same construction code.
 *
 * Subclasses should extend this class, define their concrete `product` property,
 * and implement chainable methods using the {@link register} method.
 *
 * @template TProduct The type of the product being built.
 *
 * @example
 * Builder with external input product
 * ```ts
 * interface User {
 *   name: string;
 *   age: number;
 * }
 *
 * class UserBuilder extends Builder<User> {
 *   constructor(protected override product: User) {
 *     super();
 *   }
 *
 *   setName(name: string) {
 *     return this.register((product) => {
 *       product.name = name;
 *     });
 *   }
 * }
 *
 * const user = new UserBuilder({ name: '', age: 0 })
 *   .setName('John Doe')
 *   .build();
 * ```
 *
 * @example
 * Builder with fresh product
 * ```ts
 * interface UserUpdatable {
 *   name?: string;
 *   age?: string;
 * }
 *
 * class UserUpdateBuilder extends Builder<UserUpdatable> {
 *   protected override product: UserUpdatable = {};
 *
 *   constructor(product?: UserUpdatable) {
 *     super();
 *
 *     this.product = product;
 *   }
 * }
 *
 * const data = new UserUpdateBuilder().setName("John Doe").build();
 * ```
 */
export abstract class Builder<TProduct> {
  /**
   * The product instance being constructed by this builder.
   * Must be initialized by the subclass.
   */
  protected abstract product: TProduct;

  /**
   * Internal flag to track if any builder mutations have been registered/executed.
   */
  protected _isActive = false;

  /**
   * Indicates whether the builder has performed/registered any modifications
   * on the product.
   */
  get isActive() {
    return this._isActive;
  }

  /**
   * Returns the final built product instance.
   *
   * @returns The constructed product of type `TProduct`.
   */
  build() {
    return this.product;
  }

  /**
   * Registers and immediately executes a modification function on the product.
   * Sets the builder's active state to `true` and returns the builder instance
   * for method chaining.
   *
   * @param fn A callback function that receives the current product and performs modifications on
   * it.
   * @returns The builder instance (`this`) to allow fluent method chaining.
   */
  register(fn: (product: TProduct) => void) {
    fn(this.product);
    this._isActive = true;
    return this;
  }
}
