---
title: log-error
---

# Log error using ErrorBase

When working with logs in production, many log explorer systems (like Datadog, Kibana, or AWS CloudWatch) prefer logging in JSON format. This allows you to easily search, filter, and alert on specific fields like `code`, `message`, or the execution `stack`.

By default, JavaScript's native `Error` class does not serialize cleanly to a JSON string because properties like `message` and `stack` are non-enumerable. Calling `JSON.stringify(new Error("something went wrong"))` returns an empty object `{}`.

The `ErrorBase` class in `@tusss/ood` implements `IModel<ErrorBase>`, providing structured serialization helper methods `toStruct()` and `toJSON()` out-of-the-box.

## Define Domain Errors

You can create specialized domain errors by extending `ErrorBase`:

```ts
import { ErrorBase } from "@tusss/ood";

export class ValidationError extends ErrorBase {
  override readonly name = "ValidationError";

  constructor(message: string, opt?: { cause?: string }) {
    // Pass a distinct error code, message, and optional cause
    super("VALIDATION_ERROR", message, opt);
  }
}

export class NotFoundError extends ErrorBase {
  override readonly name = "NotFoundError";

  constructor(resource: string, id: string, opt?: { cause?: string }) {
    super("NOT_FOUND", `${resource} with ID ${id} not found`, opt);
  }
}
```

## Serialize Errors to JSON

Since `ErrorBase` implements `toJSON()`, standard JSON serialization utility functions and logging libraries will automatically pick up all error fields (including the message and stack trace) when serializing the error.

### Using JSON.stringify

```ts
import { ValidationError } from "./errors";

try {
  throw new ValidationError("Invalid email format", { cause: "Email must contain @" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(JSON.stringify(error, null, 2));
  }
}
```

**Output:**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "name": "ValidationError",
  "cause": "Email must contain @",
  "stack": "ValidationError: Invalid email format\n    at ... (stack trace)"
}
```

### Integration with Logging Libraries (e.g., Winston / Pino)

When configuring your logger, you can serialize error objects cleanly using `toStruct()` or `.toJSON()`.

```ts
import winston from "winston";
import { NotFoundError } from "./errors";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

function getUser(id: string) {
  try {
    // Simulate user search failure
    throw new NotFoundError("User", id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Winston will automatically call the error's toJSON() method
      logger.error("Failed to retrieve user details", { err: error });
    }
  }
}

getUser("usr_12345");
```

**Logged JSON Payload:**
```json
{
  "level": "error",
  "message": "Failed to retrieve user details",
  "err": {
    "code": "NOT_FOUND",
    "message": "User with ID usr_12345 not found",
    "name": "NotFoundError",
    "stack": "NotFoundError: User with ID usr_12345 not found\n    at getUser ..."
  }
}
```

## Mapping Errors to HTTP API Responses

In a web application framework (like Express or Fastify), you can write a central error handling middleware that captures thrown `ErrorBase` exceptions and formats them into standardized JSON responses for the client:

```ts
import { Request, Response, NextFunction } from "express";
import { ErrorBase } from "@tusss/ood";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ErrorBase) {
    const errorDetail = err.toStruct();
    
    // Hide stack trace in production environments
    if (process.env.NODE_ENV === "production") {
      delete errorDetail.stack;
    }

    return res.status(mapCodeToStatus(err.code)).json({
      success: false,
      error: errorDetail,
    });
  }

  // Fallback for generic/unhandled errors
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}

function mapCodeToStatus(code: string): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 400;
    default:
      return 500;
  }
}
```
