---
title: model
---

# Domain Modeling with Model

In Domain-Driven Design (DDD), domain entities encapsulate both state (data properties) and behaviors (business logic methods). However, when communicating with databases, external APIs, or client interfaces, you only want to work with raw data structures (records/structs) without any class methods.

The `Model` abstract class from `@tusss/ood` resolves this by requiring you to define the structure representation of your class via the `toStruct()` method.

The `ClassProperties<C>` type helper utility automatically strips away all methods, functions, and non-enumerable properties from your class, ensuring that the returned object contains only pure data.

This recipe demonstrates how to define rich domain entities with nested sub-models and serialize them cleanly.

## Defining Entities and Sub-Models

Let's build a shopping cart domain containing `OrderItem` and `Order` entities.

### 1. Implement the Sub-Model: `OrderItem`

```ts
import { Model } from "@tusss/ood";
import { ClassProperties } from "@tusss/ood";

export class OrderItem extends Model<OrderItem> {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly price: number,
    readonly quantity: number,
  ) {
    super();
  }

  // Business Behavior
  get totalPrice(): number {
    return this.price * this.quantity;
  }

  // Define how this item is serialized to a plain data structure
  override toStruct(): ClassProperties<OrderItem> {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      totalPrice: this.totalPrice,
    };
  }
}
```

### 2. Implement the Main Aggregate Model: `Order`

The main model holds a collection of sub-models and delegates serialization to them:

```ts
import { Model } from "@tusss/ood";
import { ClassProperties } from "@tusss/ood";
import { OrderItem } from "./order-item";

export class Order extends Model<Order> {
  private _items: OrderItem[] = [];

  constructor(
    readonly id: string,
    readonly customerId: string,
  ) {
    super();
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  // Business Behaviors
  addItem(item: OrderItem) {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }
    this._items.push(item);
  }

  getSubTotal(): number {
    return this._items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  // Serialize the main model and map all nested models
  override toStruct(): ClassProperties<Order> {
    return {
      id: this.id,
      customerId: this.customerId,
      // Map each OrderItem sub-model using its own toStruct()
      items: this._items.map((item) => item.toStruct()),
    };
  }
}
```

## Serialization in Action

Once your domain model has performed its operations, you can easily export it to save to a database or send as an API response:

```ts
import { Order } from "./order";
import { OrderItem } from "./order-item";

const order = new Order("ord_001", "cust_99");

order.addItem(new OrderItem("item_1", "Mechanical Keyboard", 120, 1));
order.addItem(new OrderItem("item_2", "Ergonomic Mouse", 80, 2));

// 1. Get the subtotal using domain methods
console.log("Subtotal:", order.getSubTotal()); // Subtotal: 280

// 2. Export to a database/API-safe plain object structure
const orderData = order.toStruct();
console.log(orderData);
```

**Output Struct:**

```json
{
  "id": "ord_001",
  "customerId": "cust_99",
  "items": [
    {
      "id": "item_1",
      "name": "Mechanical Keyboard",
      "price": 120,
      "quantity": 1
    },
    {
      "id": "item_2",
      "name": "Ergonomic Mouse",
      "price": 80,
      "quantity": 2
    }
  ]
}
```

> [!TIP]
> The `Model` class implements `toJSON()` under the hood to return the output of `toStruct()`. Consequently, passing the model directly to `JSON.stringify(order)` will automatically serialize it to the correct JSON data structure without enclosing any class methods or functions.

## Next.js Server Components Caveat

In Next.js App Router, passing data from a Server Component to a Client Component requires that the data be **strictly serializable**.

If you attempt to pass a raw class instance (e.g. `order` containing class methods) across the server-client boundary via props, Next.js will throw a serialization runtime error:

> `Error: Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or functions cannot be passed.`

To avoid this, you can invoke `toStruct()` on the server side to obtain a plain, strictly serializable object before passing it down:

```tsx
// app/orders/page.tsx (Server Component)
import { Order } from "@/domain/order";
import { OrderItem } from "@/domain/order-item";
import { OrderDetailsClient } from "./order-details-client";

export default async function OrderPage() {
  const order = new Order("ord_001", "cust_99");
  order.addItem(new OrderItem("item_1", "Keyboard", 120, 1));

  // CORRECT: toStruct() returns a plain, serializable object structure
  const orderData = order.toStruct();

  return (
    <div>
      <h1>Order Page</h1>
      {/* Pass the serialized struct to the Client Component */}
      <OrderDetailsClient order={orderData} />
    </div>
  );
}
```

In the Client Component, you can use the `ClassProperties` helper type to represent the serialized state cleanly:

```tsx
// app/orders/order-details-client.tsx (Client Component)
"use client";

import { ClassProperties } from "@tusss/ood";
import { Order } from "@/domain/order";

interface OrderDetailsClientProps {
  // Use ClassProperties type helper to represent the exact type-safe shape
  order: ClassProperties<Order>;
}

export function OrderDetailsClient({ order }: OrderDetailsClientProps) {
  return (
    <div>
      <p>Order ID: {order.id}</p>
      <p>Customer ID: {order.customerId}</p>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
```
