export abstract class Model<TData> {
  abstract toStruct(): TData;
}
