---
title: singleton
---

# Singleton Pattern for Shared Services

The Singleton design pattern guarantees that a class has only a single instance throughout the application lifecycle, while providing a global access point to it. This is highly useful for shared resource coordinators, such as:

- Database client connections.
- Configuration repositories.
- Internal caching services.

The `@tusss/ood` package provides a `Singleton` class mixin function that wraps any class constructor and exposes a static `instance` getter property. The instance is lazily instantiated upon the first access.

This recipe demonstrates how to define a shared database connection client.

## Creating a Database Singleton

Define a regular class representing your service, then wrap it with the `Singleton` utility.

```ts
// src/database/connection.ts
import { Singleton } from "@tusss/ood";

class DatabaseConnection {
  private isConnected = false;

  constructor() {
    // In a real application, initialize your DB client here (e.g., Prisma, pg, or mongoose)
    console.log("DatabaseConnection constructor invoked.");
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("Already connected to the database.");
      return;
    }

    console.log("Establishing database connection...");
    this.isConnected = true;
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.isConnected) {
      throw new Error("Must connect to database before running queries.");
    }
    console.log(`Executing query: "${sql}" with params:`, params);
    return [];
  }
}

// Wrap the class using Singleton.
// This returns a class constructor that has the static 'instance' property.
export const DbClient = Singleton(DatabaseConnection);
```

## Usage Example

Import the wrapped singleton in different parts of your application:

```ts
// src/app.ts
import { DbClient } from "./database/connection";

async function runApplication() {
  // 1. First access to DbClient.instance:
  // This triggers the DatabaseConnection constructor and establishes the connection.
  const db1 = DbClient.instance;
  await db1.connect();

  // 2. Accessing the instance again from another module or location:
  // This returns the exact same instance. No new constructor is invoked.
  const db2 = DbClient.instance;
  await db2.query("SELECT * FROM users LIMIT $1", [10]);

  // Verify that both instances point to the identical memory location
  console.log("Are db1 and db2 identical?", db1 === db2); // true
}

runApplication();
```
