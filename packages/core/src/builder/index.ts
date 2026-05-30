export abstract class Builder<TProduct> {
  protected abstract product: TProduct;

  protected _isActive = false;

  get isActive() {
    return this._isActive;
  }

  build() {
    return this.product;
  }

  register(fn: (product: TProduct) => void) {
    fn(this.product);
    this._isActive = true;
    return this;
  }
}
