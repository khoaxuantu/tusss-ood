type Primitive = string | number | boolean | bigint | symbol | undefined | null | Date | RegExp;

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
