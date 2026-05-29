import { describe, expect, test } from "bun:test";
import { Factory, FactoryMaterial, FactoryOrchestrator } from ".";

type TMaterialType = "A" | "B";

class MaterialA extends FactoryMaterial<TMaterialType> {
  override readonly type: TMaterialType = "A";
}
class MaterialB extends FactoryMaterial<TMaterialType> {
  override readonly type: TMaterialType = "B";
}

class Product {
  constructor(readonly name: string) {}
}

class FactoryA extends Factory<Product> {
  override create(): Product {
    return new Product("A");
  }
}

class FactoryB extends Factory<Product> {
  override create(): Product {
    return new Product("B");
  }
}

class Orchestrator extends FactoryOrchestrator<Product> {
  override cluster: Map<TMaterialType, new (material: FactoryMaterial) => Factory<Product>>;

  constructor() {
    super();

    this.cluster = new Map([
      ["A", FactoryA],
      ["B", FactoryB],
    ]);
  }
}

const orchestrator = new Orchestrator();

describe("Factory", () => {
  test("A", () => {
    const result = orchestrator.create(new MaterialA());
    expect(result).toEqual(new Product("A"));
  });

  test("B", () => {
    const result = orchestrator.create(new MaterialB());
    expect(result).toEqual(new Product("B"));
  });
});
