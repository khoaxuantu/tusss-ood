import { Model } from "../model";
import { ClassProperties } from "../types";

/**
 * Represents the parameters for pagination, specifying the current page and item limit.
 */
export interface PaginationParams {
  /**
   * The 1-based index of the current page.
   */
  page: number;
  /**
   * The maximum number of items to return per page.
   */
  perPage: number;
}

/**
 * Represents the parameters for a pagination result, extending standard pagination parameters
 * with total item count.
 */
export interface PaginationResultParams extends PaginationParams {
  /**
   * The total number of items across all pages.
   */
  total: number;
}

/**
 * Helper class for calculating pagination offsets and limits.
 *
 * @example
 * Basic pagination usage
 * ```ts
 * const pagination = new Pagination({ page: 2, perPage: 10 });
 * console.log(pagination.skip); // 10
 * console.log(pagination.limit); // 10
 * ```
 */
export class Pagination extends Model<Pagination> implements PaginationParams {
  /**
   * The 1-based index of the current page.
   */
  page: number;
  /**
   * The maximum number of items to return per page.
   */
  perPage: number;

  /**
   * Default page index (1).
   */
  static page = 1;
  /**
   * Default page size (10).
   */
  static perPage = 10;

  /**
   * Creates a new `Pagination` instance.
   *
   * @param data - Optional partial pagination parameters. Defaults to static page (1) and perPage (10).
   */
  constructor(data?: Partial<PaginationParams>) {
    super();

    this.page = data?.page ?? Pagination.page;
    this.perPage = data?.perPage ?? Pagination.perPage;
  }

  /**
   * The number of items to skip/offset for database or API queries.
   */
  get skip() {
    return (this.page - 1) * this.perPage;
  }

  /**
   * The maximum number of items to return (alias for `perPage`).
   */
  get limit() {
    return this.perPage;
  }

  override toStruct(): ClassProperties<Pagination> {
    return {
      limit: this.limit,
      page: this.page,
      perPage: this.perPage,
      skip: this.skip,
    };
  }
}

/**
 * Represents the result of a paginated query, detailing metadata about pages and total counts.
 *
 * @example
 * Creating a pagination result from standard pagination and total count
 * ```ts
 * const pagination = new Pagination({ page: 2, perPage: 10 });
 * const result = new PaginationResult(pagination, 25);
 *
 * console.log(result.totalPages); // 3
 * console.log(result.nextPage); // 3
 * console.log(result.prevPage); // 1
 * ```
 */
export class PaginationResult extends Model<PaginationResult> implements PaginationResultParams {
  /**
   * The 1-based index of the current page.
   */
  page: number;
  /**
   * The maximum number of items per page.
   */
  perPage: number;
  /**
   * The total number of items matching the query.
   */
  total: number;
  /**
   * The total number of pages calculated from `total` and `perPage`.
   */
  totalPages: number;
  /**
   * The page index for the next page, or `undefined` if on the last page.
   */
  nextPage?: number;
  /**
   * The page index for the previous page, or `undefined` if on the first page.
   */
  prevPage?: number;

  /**
   * Creates a pagination result from a single object implementing `PaginationResultParams`.
   *
   * @param data - Parameter object containing page, perPage, and total count.
   */
  constructor(data: PaginationResultParams);
  /**
   * Creates a pagination result from a `Pagination` instance and a total count.
   *
   * @param data - The `Pagination` instance specifying page and perPage.
   * @param total - The total number of items.
   */
  constructor(data: Pagination, total: number);
  /**
   * Internal constructor implementation handling both constructor signatures.
   */
  constructor(data: Pagination | PaginationResultParams, total: number = 0) {
    super();

    this.page = data.page;
    this.perPage = data.perPage;

    if (data instanceof Pagination) this.total = total;
    else this.total = data.total;

    this.totalPages = Math.ceil(this.total / this.perPage);

    if (this.page + 1 <= this.totalPages) this.nextPage = this.page + 1;
    if (this.page > 1) this.prevPage = this.page - 1;
  }

  override toStruct(): ClassProperties<PaginationResult> {
    return {
      page: this.page,
      perPage: this.perPage,
      total: this.total,
      totalPages: this.totalPages,
      nextPage: this.nextPage,
      prevPage: this.prevPage,
    };
  }
}

/**
 * A generic wrapper that encapsulates a list of data items and its associated pagination metadata.
 *
 * @template TData - The type of items in the data array.
 *
 * @example
 * Wrapping search results with Paginable
 * ```ts
 * const pagination = new Pagination({ page: 1, perPage: 2 });
 * const result = new PaginationResult(pagination, 5);
 * const items = ['apple', 'banana'];
 *
 * const paginable = new Paginable(items, result);
 * console.log(paginable.data); // ['apple', 'banana']
 * console.log(paginable.pagination.total); // 5
 * ```
 */
export class Paginable<TData = any> {
  /**
   * The paginated subset of items.
   */
  data: TData[];
  /**
   * The pagination metadata associated with the data subset.
   */
  pagination: PaginationResult;

  /**
   * Creates an instance of `Paginable`.
   *
   * @param data - The array of items on the current page.
   * @param pagination - The pagination metadata.
   */
  constructor(data: TData[], pagination: PaginationResult) {
    this.data = data;
    this.pagination = pagination;
  }
}
