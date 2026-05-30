import { ClassProperties } from "../types";

export abstract class Model<TData> {
  abstract toStruct(): ClassProperties<TData>;
}
