---
title: result
---

# Result Pattern

In TypeScript, error handling is commonly done via `try/catch` blocks. This approach works, but has a few shortcomings:
- The function signature does not communicate whether it can fail.
- Callers often forget to wrap calls in `try/catch`.
- Control flow is non-linear, making code harder to reason about.

The `Result<T>` class from `@tusss/ood` provides an alternative: a typed return value that explicitly represents either a **success** (carrying `data`) or a **failure** (carrying an `ErrorBase` error). The caller is forced to check `result.ok` before accessing data, making error handling an explicit, first-class concern.

## Defining Service Methods with Result

```ts
import { Result, ErrorBase } from "@tusss/ood";

interface User {
  id: string;
  email: string;
}

// Errors specific to this domain
class UserNotFoundError extends ErrorBase {
  override readonly name = "UserNotFoundError";
  constructor(id: string) {
    super("USER_NOT_FOUND", `User with ID "${id}" was not found`);
  }
}

class InvalidEmailError extends ErrorBase {
  override readonly name = "InvalidEmailError";
  constructor(email: string) {
    super("INVALID_EMAIL", `"${email}" is not a valid email address`);
  }
}

// In-memory mock store
const users: User[] = [
  { id: "u1", email: "alice@example.com" },
];

// Return Result<User> instead of throwing
async function findUserById(id: string): Promise<Result<User>> {
  const user = users.find((u) => u.id === id);

  if (!user) {
    return new Result({ error: new UserNotFoundError(id) });
  }

  return new Result({ data: user });
}

async function updateUserEmail(id: string, email: string): Promise<Result<User>> {
  if (!email.includes("@")) {
    return new Result({ error: new InvalidEmailError(email) });
  }

  const findResult = await findUserById(id);
  if (!findResult.ok) {
    // Propagate the inner error upwards
    return new Result({ error: findResult.error });
  }

  findResult.data.email = email;
  return new Result({ data: findResult.data });
}
```

## Handling Results in Callers

At the call site, you check `result.ok` before accessing `result.data`, treating both success and failure as first-class code paths:

```ts
async function main() {
  // --- Scenario 1: Successful lookup ---
  const found = await findUserById("u1");

  if (found.ok) {
    console.log("Found user:", found.data.email);
    // Found user: alice@example.com
  } else {
    console.error("Error:", found.error?.message);
  }

  // --- Scenario 2: Not found ---
  const missing = await findUserById("u99");

  if (!missing.ok) {
    console.error(`[${missing.error?.code}] ${missing.error?.message}`);
    // [USER_NOT_FOUND] User with ID "u99" was not found
  }

  // --- Scenario 3: Invalid input ---
  const badEmail = await updateUserEmail("u1", "not-an-email");

  if (!badEmail.ok) {
    console.error(`[${badEmail.error?.code}] ${badEmail.error?.message}`);
    // [INVALID_EMAIL] "not-an-email" is not a valid email address
  }
}

main();
```

## Using Result in an HTTP Controller

`Result` composes neatly with HTTP response mapping. You can write a single handler that delegates all error logic to the service layer:

```ts
import { Request, Response } from "express";
import { findUserById, updateUserEmail } from "./user.service";

export async function getUserHandler(req: Request, res: Response) {
  const result = await findUserById(req.params.id);

  if (!result.ok) {
    return res.status(mapErrorToStatus(result.error!.code)).json({
      success: false,
      error: result.error!.toStruct(),
    });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
  });
}

function mapErrorToStatus(code: string): number {
  switch (code) {
    case "USER_NOT_FOUND": return 404;
    case "INVALID_EMAIL": return 400;
    default: return 500;
  }
}
```

> [!TIP]
> Since `Result` extends `Model`, calling `result.toStruct()` returns a plain-object representation of `{ ok, data, error }`, which is safe to serialize directly into JSON API responses or pass across Next.js server-client component boundaries.
