type Constructor<T = any> = {
  new (...args: any[]): T;
};

export function Singleton<T extends Constructor>(cls: T) {
  let _instance: InstanceType<T>;

  class MixinClass extends cls {
    static get instance(): InstanceType<T> {
      if (!_instance) _instance = new cls();
      return _instance;
    }
  }

  return MixinClass;
}
