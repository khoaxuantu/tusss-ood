export abstract class FactoryMaterial<T extends string = string> {
  abstract readonly type: T;
}

export abstract class Factory<TProduct> {
  constructor(protected readonly material: FactoryMaterial) {}

  abstract create(): TProduct;
}

export abstract class FactoryOrchestrator<TProduct> {
  readonly cluster: Map<string, new (material: FactoryMaterial) => Factory<TProduct>>;

  constructor() {
    this.cluster = new Map();
  }

  create(material: FactoryMaterial): TProduct {
    const Factory = this.cluster.get(material.type);
    if (!Factory) throw new Error(`No factory found for material type: ${material.type}`);
    return new Factory(material).create();
  }
}
