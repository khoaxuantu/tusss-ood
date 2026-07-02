---
title: db-pagination-sorting
---

# Database Pagination & Sorting

When building REST or GraphQL APIs, pagination and sorting are critical features for handling large datasets efficiently.

The `@tusss/ood` package provides the `Pagination`, `Sort`, `PaginationResult`, and `Paginable` utilities to simplify query offset/limit calculations, validate sort parameters, and build standard, client-friendly responses.

This recipe demonstrates how to integrate these classes with a database library (in this example, [Prisma](https://www.prisma.io/)) to paginate and sort records.

## Express.js API Example

Let's write a route handler that fetches a list of users, applies pagination and sorting from the request query string, queries the database, and returns a paginated structure.

### 1. Define Valid Sort Fields

Create a type for the properties of the model that the client is allowed to sort:

```ts
// src/user/types.ts
export type UserSortableFields = "id" | "name" | "createdAt";
```

### 2. Implement the Service Layer (using Prisma)

The service accepts a `Pagination` instance and a `Sort` instance, uses them to construct the Prisma query, and returns a `Paginable` container.

```ts
// src/user/user.service.ts
import { PrismaClient } from "@prisma/client";
import { Pagination, Sort, PaginationResult, Paginable } from "@tusss/ood";
import { UserSortableFields } from "./types";

const prisma = new PrismaClient();

export class UserService {
  async getUsers(
    pagination: Pagination,
    sort: Sort<UserSortableFields>
  ): Promise<Paginable> {
    // 1. Run database queries concurrently: fetch data and count total records
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        // Map Pagination to Prisma's limit/offset configuration
        take: pagination.limit,
        skip: pagination.skip,
        
        // Map Sort to Prisma's sorting order
        orderBy: {
          [sort.field]: sort.direction,
        },
      }),
      prisma.user.count(),
    ]);

    // 2. Instantiate PaginationResult with pagination config and total count
    const paginationResult = new PaginationResult(pagination, total);

    // 3. Wrap records and metadata into a Paginable response container
    return new Paginable(users, paginationResult);
  }
}
```

### 3. Handle Request in Controller / Route

Extract, sanitize, and validate request queries into `Pagination` and `Sort` instances:

```ts
// src/user/user.controller.ts
import { Request, Response } from "express";
import { Pagination, Sort } from "@tusss/ood";
import { UserService } from "./user.service";
import { UserSortableFields } from "./types";

const userService = new UserService();

export async function listUsers(req: Request, res: Response) {
  try {
    // Parse pagination options (falls back to page=1, perPage=10 by default)
    const page = req.query.page ? Number(req.query.page) : undefined;
    const perPage = req.query.perPage ? Number(req.query.perPage) : undefined;
    const pagination = new Pagination({ page, perPage });

    // Parse sorting options
    const sortField = (req.query.sortBy as UserSortableFields) || "createdAt";
    const sortDir = req.query.sortOrder === "desc" ? "desc" : "asc";
    
    // Ensure only valid fields can be sorted
    const allowedFields: UserSortableFields[] = ["id", "name", "createdAt"];
    const field = allowedFields.includes(sortField) ? sortField : "id";

    const sort = new Sort<UserSortableFields>({
      field,
      direction: sortDir,
    });

    // Fetch paginated results
    const results = await userService.getUsers(pagination, sort);

    // Serialize cleanly back to client (toJSON() is supported under the hood)
    return res.status(200).json({
      success: true,
      data: results.data,
      pagination: results.pagination.toStruct(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
}
```

## Expected API JSON Response

Calling `/users?page=2&perPage=5&sortBy=name&sortOrder=desc` will yield:

```json
{
  "success": true,
  "data": [
    { "id": 12, "name": "Charlie", "createdAt": "2026-06-15T08:00:00.000Z" },
    { "id": 5, "name": "Bob", "createdAt": "2026-06-12T14:30:00.000Z" }
  ],
  "pagination": {
    "page": 2,
    "perPage": 5,
    "total": 12,
    "totalPages": 3,
    "nextPage": 3,
    "prevPage": 1
  }
}
```
