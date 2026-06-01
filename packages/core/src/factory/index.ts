/**
 * Abstract base class representing a material used by a factory to create products.
 *
 * Each material must have a distinct type associated with it, which is used
 * by the {@link FactoryDirector} to dispatch the material to the correct factory.
 *
 * @template T The type constraint for the material's type identifier, defaulting to `string`.
 */
export abstract class FactoryMaterial<T extends string = string> {
  /**
   * The unique type identifier for this material.
   */
  abstract readonly type: T;
}

/**
 * Abstract base class for implementing the Factory design pattern.
 *
 * A factory is responsible for creating a product of type `TProduct` using
 * a specified {@link FactoryMaterial}.
 *
 * @template TProduct The type of product constructed by the factory.
 */
export abstract class Factory<TProduct> {
  /**
   * Constructs a new factory instance.
   *
   * @param material The material details to construct the product from.
   */
  constructor(protected readonly material: FactoryMaterial) {}

  /**
   * Creates and returns the product instance.
   *
   * @returns The constructed product of type `TProduct`.
   */
  abstract create(): TProduct;
}

/**
 * Abstract base class for orchestrating multiple factories based on material types.
 *
 * Keeps a registry (cluster) mapping material type strings to their respective
 * factory constructors, allowing dynamic product instantiation based on material input.
 *
 * @template TProduct The type of products created by the registered factories.
 *
 * @example
 * Example demonstrating factory orchestration with Materials A/B and Product
 * ```ts
 * type TMaterialType = "A" | "B";
 *
 * class MaterialA extends FactoryMaterial<TMaterialType> {
 *   override readonly type: TMaterialType = "A";
 * }
 * class MaterialB extends FactoryMaterial<TMaterialType> {
 *   override readonly type: TMaterialType = "B";
 * }
 *
 * class Product {
 *   constructor(readonly name: string) {}
 * }
 *
 * class FactoryA extends Factory<Product> {
 *   override create(): Product {
 *     return new Product("A");
 *   }
 * }
 * class FactoryB extends Factory<Product> {
 *   override create(): Product {
 *     return new Product("B");
 *   }
 * }
 *
 * class Director extends FactoryDirector<Product> {
 *   override cluster = new Map<TMaterialType, new (material: FactoryMaterial) => Factory<Product>>([
 *     ["A", FactoryA],
 *     ["B", FactoryB],
 *   ]);
 * }
 *
 * const director = new Director();
 * const productA = director.create(new MaterialA()); // Product { name: "A" }
 * ```
 */
export abstract class FactoryDirector<TProduct> {
  /**
   * Map containing factory constructor associations keyed by material type name.
   */
  readonly cluster: Map<string, new (material: FactoryMaterial) => Factory<TProduct>>;

  /**
   * Initializes a new factory Director with an empty factory cluster.
   */
  constructor() {
    this.cluster = new Map();
  }

  /**
   * Orchestrates the creation of a product. Looks up the appropriate factory class
   * based on the input material type, instantiates it with the material, and builds the product.
   *
   * @param material The material input to determine which factory to run.
   * @returns The constructed product of type `TProduct`.
   * @throws Error If no factory has been registered for the given material type.
   */
  create(material: FactoryMaterial): TProduct {
    const Factory = this.cluster.get(material.type);
    if (!Factory) throw new Error(`No factory found for material type: ${material.type}`);
    return new Factory(material).create();
  }
}
