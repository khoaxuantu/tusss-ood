---
title: printer
---

# Formatting and Logging with Printer

When displaying models to users, logging diagnostic states to files, or writing terminal outputs, you often need to represent objects in customized string formats (such as standard console grids, JSON lines, or HTML blocks).

The `Printer` abstract class from `@tusss/ood` serves as a standard contract for any class or object capable of rendering a string representation of its state via `toString()`.

This recipe demonstrates how to extend `Printer` to build a text-based terminal receipt renderer.

## Implementing a Receipt Printer

Let's define a `ReceiptPrinter` class that formats a shopping transaction into a neat, double-border console receipt.

```ts
import { Printer } from "@tusss/ood";

interface LineItem {
  name: string;
  qty: number;
  price: number;
}

export class ReceiptPrinter extends Printer {
  constructor(
    private readonly transactionId: string,
    private readonly date: Date,
    private readonly items: LineItem[]
  ) {
    super();
  }

  // Calculate the total amount
  private get total(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // Override the toString method to customize the console representation
  override toString(): string {
    const width = 40;
    const border = "=".repeat(width);
    const line = "-".repeat(width);

    // Format transaction details
    const header = [
      border,
      "           TRANSACTION RECEIPT          ",
      border,
      `ID:   ${this.transactionId.padEnd(width - 6)}`,
      `Date: ${this.date.toISOString().slice(0, 10).padEnd(width - 6)}`,
      line,
    ];

    // Format individual line items
    const body = this.items.map((item) => {
      const label = `${item.name} x${item.qty}`;
      const cost = `$${(item.price * item.qty).toFixed(2)}`;
      const spaces = width - label.length - cost.length;
      return label + " ".repeat(spaces > 0 ? spaces : 1) + cost;
    });

    // Format payment summary
    const footer = [
      line,
      `TOTAL AMOUNT:             $${this.total.toFixed(2).padStart(12)}`,
      border,
    ];

    return [...header, ...body, ...footer].join("\n");
  }
}
```

## Usage Example

Instantiate the printer and print it directly:

```ts
import { ReceiptPrinter } from "./receipt-printer";

const printer = new ReceiptPrinter(
  "tx_992144",
  new Date("2026-07-02T10:00:00Z"),
  [
    { name: "Wireless Headphones", qty: 1, price: 149.99 },
    { name: "USB-C Adapter Hub", qty: 2, price: 35.00 },
    { name: "Tempered Glass Screen", qty: 3, price: 12.50 },
  ]
);

// Calling console.log automatically invokes the printer's toString() method
console.log(printer.toString());
```

**Console Output:**
```text
========================================
           TRANSACTION RECEIPT          
========================================
ID:   tx_992144                         
Date: 2026-07-02                        
----------------------------------------
Wireless Headphones x1           $149.99
USB-C Adapter Hub x2              $70.00
Tempered Glass Screen x3          $37.50
----------------------------------------
TOTAL AMOUNT:             $       257.49
========================================
```

---

## Polymorphic Printing

You can design services that accept a `Printer` instance, allowing you to swap formatting strategies (e.g., printing HTML, JSON, or plaintext) at runtime.

```ts
import { Printer } from "@tusss/ood";

class JsonReceiptPrinter extends Printer {
  constructor(private readonly data: any) {
    super();
  }

  override toString(): string {
    return JSON.stringify({ type: "receipt", ...this.data });
  }
}

// Log dispatcher accepting any Printer interface
function logReceipt(printer: Printer) {
  // Polymorphically formats based on implementation
  console.log("[LOG-RECEIPT]:\n" + printer.toString());
}
```
