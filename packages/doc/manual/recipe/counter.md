---
title: counter
---

# Counter for Sequential Operations

Maintaining an incremental state is a common requirement in software development. Examples include generating auto-incremented IDs for local mocks, counting retry attempts during network failures, or tracking iteration steps.

The `Counter` class from `@tusss/ood` provides an encapsulated, class-based approach to increment, inspect, and reset numeric counters.

This recipe showcases two practical use cases for `Counter`: in-memory ID generation and an API retry mechanism.

## Use Case 1: Auto-Incrementing Mock IDs

When writing unit tests or building local development databases, you often need to generate unique, sequential IDs for mock entities.

```ts
import { Counter } from "@tusss/ood";

interface User {
  id: number;
  name: string;
}

export class UserMockRepository {
  // Initialize counter starting from 1
  private idCounter = new Counter(1);
  private users: User[] = [];

  createUser(name: string): User {
    const newUser: User = {
      // Get the next incremented value
      id: this.idCounter.next(),
      name,
    };
    
    this.users.push(newUser);
    return newUser;
  }

  getUsers(): User[] {
    return this.users;
  }

  clear() {
    this.users = [];
    // Reset the counter back to its initial value (1)
    this.idCounter.reset();
  }
}
```

### Usage

```ts
const repo = new UserMockRepository();

console.log(repo.createUser("Alice")); // { id: 1, name: "Alice" }
console.log(repo.createUser("Bob"));   // { id: 2, name: "Bob" }

repo.clear();
console.log(repo.createUser("Charlie")); // { id: 1, name: "Charlie" }
```

---

## Use Case 2: Network Retry Handler

When calling external APIs or communicating over fragile network protocols, you may want to retry operations up to a maximum limit. `Counter` is perfect for keeping track of retry attempts in a clean, stateful manner.

```ts
import { Counter } from "@tusss/ood";

export class ApiService {
  private retryCounter = new Counter(0);
  private readonly maxRetries = 3;

  async fetchDataWithRetry(url: string): Promise<any> {
    while (this.retryCounter.current < this.maxRetries) {
      try {
        console.log(`Fetching data (Attempt ${this.retryCounter.current + 1}/${this.maxRetries})...`);
        const result = await this.unstableFetch(url);
        
        // On success, reset the retry counter for future requests
        this.retryCounter.reset();
        return result;
      } catch (error) {
        // Increment the retry counter
        this.retryCounter.next();
        
        if (this.retryCounter.current >= this.maxRetries) {
          this.retryCounter.reset(); // Reset state before throwing
          throw new Error(`Failed to fetch data after ${this.maxRetries} attempts.`);
        }
        
        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private async unstableFetch(url: string): Promise<any> {
    // Simulate connection errors in 70% of requests
    if (Math.random() < 0.70) {
      throw new Error("Network timeout");
    }
    return { data: "Success from " + url };
  }
}
```
