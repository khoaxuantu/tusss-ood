/**
 * Represents the parameters used to configure sorting.
 *
 * @template TField - The union type of valid fields that can be sorted.
 */
export interface SortParams<TField extends string> {
  /**
   * The field to sort by.
   */
  field: TField;

  /**
   * The direction of the sort: ascending (`asc`) or descending (`desc`).
   */
  direction: "asc" | "desc";
}

/**
 * A class representing a sort configuration, implementing {@link SortParams}.
 *
 * @template TField - The union type of valid fields that can be sorted. Defaults to `string`.
 *
 * @example
 * Basic usage showing default sort creation and sorting with custom parameters:
 * ```ts
 * // Default sort: field is "id", direction is "asc"
 * const defaultSort = new Sort();
 * console.log(defaultSort.field); // "id"
 * console.log(defaultSort.direction); // "asc"
 *
 * // Custom sort
 * const nameSort = new Sort({ field: "name", direction: "desc" });
 * console.log(nameSort.field); // "name"
 * console.log(nameSort.direction); // "desc"
 * ```
 */
export class Sort<TField extends string = string> implements SortParams<TField> {
  /**
   * The field to sort by.
   */
  field: TField;

  /**
   * The direction of the sort: ascending (`asc`) or descending (`desc`).
   */
  direction: "asc" | "desc";

  /**
   * Initializes a new instance of the Sort class.
   *
   * @param data - Optional sort parameters to initialize the configuration.
   */
  constructor(data?: SortParams<TField>) {
    this.field = data?.field ?? ("id" as TField);
    this.direction = data?.direction ?? "asc";
  }
}

