import { describe, expect, test } from "bun:test";
import { Paginable, Pagination, PaginationResult } from ".";

describe(Pagination, () => {
  test("skip", () => {
    const pagination = new Pagination({ page: 1, perPage: 10 });
    expect(pagination.skip).toEqual(0);
    const pagination2 = new Pagination({ page: 2, perPage: 10 });
    expect(pagination2.skip).toEqual(10);
  });

  test("limit", () => {
    const pagination = new Pagination({ page: 1, perPage: 10 });
    expect(pagination.limit).toEqual(10);
    const pagination2 = new Pagination({ page: 2, perPage: 20 });
    expect(pagination2.limit).toEqual(20);
  });
});

describe(PaginationResult, () => {
  test("constructor from Pagination", () => {
    const paginationResult = new PaginationResult(new Pagination({ page: 1, perPage: 10 }), 100);
    expect(paginationResult.page).toEqual(1);
    expect(paginationResult.perPage).toEqual(10);
    expect(paginationResult.total).toEqual(100);
  });

  test("constructor from PaginationResultParams", () => {
    const paginationResult = new PaginationResult({ page: 1, perPage: 10, total: 100 });
    expect(paginationResult.page).toEqual(1);
    expect(paginationResult.perPage).toEqual(10);
    expect(paginationResult.total).toEqual(100);
  });

  test("totalPages", () => {
    const paginationResult = new PaginationResult({ page: 1, perPage: 10, total: 100 });
    expect(paginationResult.totalPages).toEqual(10);
    const paginationResult2 = new PaginationResult({ page: 2, perPage: 20, total: 200 });
    expect(paginationResult2.totalPages).toEqual(10);
  });

  test("nextPage", () => {
    const paginationResult = new PaginationResult({ page: 1, perPage: 10, total: 100 });
    expect(paginationResult.nextPage).toEqual(2);
    const paginationResult2 = new PaginationResult({ page: 10, perPage: 10, total: 100 });
    expect(paginationResult2.nextPage).toEqual(undefined);
  });

  test("prevPage", () => {
    const paginationResult = new PaginationResult({ page: 1, perPage: 10, total: 100 });
    expect(paginationResult.prevPage).toEqual(undefined);
    const paginationResult2 = new PaginationResult({ page: 2, perPage: 10, total: 100 });
    expect(paginationResult2.prevPage).toEqual(1);
  });
});

describe(Paginable, () => {
  test("constructor", () => {
    const paginable = new Paginable(
      [1, 2, 3],
      new PaginationResult({ page: 1, perPage: 10, total: 100 }),
    );
    expect(paginable.data).toEqual([1, 2, 3]);
    expect(paginable.pagination).toEqual(
      new PaginationResult({ page: 1, perPage: 10, total: 100 }),
    );
  });
});
