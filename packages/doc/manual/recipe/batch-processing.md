---
title: batch-processing
---

# Batch Processing with BatchExecutor

Many external API services (such as Datadog, Mixpanel, or Segment) recommend batching multiple payloads into a single HTTP request to minimize network overhead and avoid hitting rate limits. Similarly, when writing to databases, bulk inserts are significantly faster than individual write queries.

The `BatchExecutor` class from `@tusss/ood` provides a clean interface to queue operations and execute them in groups once they reach a predefined capacity.

This recipe demonstrates how to build a background event batcher that collects analytical events, flush-executes them when they hit capacity, or automatically flushes them after a timeout so that events aren't delayed indefinitely.

## Implementing an Event Batcher

Let's define the tracking event type and set up a class that manages the batching process.

```ts
import { BatchExecutor } from "@tusss/ood";

// Define the analytics event structure
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export class AnalyticsBatcher {
  private executor: BatchExecutor<AnalyticsEvent>;
  private flushTimeout: NodeJS.Timeout | null = null;
  private readonly idleTimeoutMs: number;

  constructor(capacity = 20, idleTimeoutMs = 5000) {
    this.idleTimeoutMs = idleTimeoutMs;

    this.executor = new BatchExecutor<AnalyticsEvent>({
      name: "analytics-batch-executor",
      capacity,
      execute: async (events) => {
        await this.sendEventsToProvider(events);
      },
    });
  }

  /**
   * Queue a new event.
   */
  async track(event: string, properties: Record<string, any> = {}) {
    const payload: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
    };

    // Add to the batch
    this.executor.add(payload);

    // If the executor hits its capacity, execute and flush immediately
    if (this.executor.isFull) {
      await this.flush();
    } else {
      // Otherwise, ensure we trigger a timeout to flush pending events
      this.resetFlushTimeout();
    }
  }

  /**
   * Manually trigger a flush of any remaining events in the batch.
   */
  async flush() {
    this.clearFlushTimeout();
    if (!this.executor.isEmpty) {
      try {
        await this.executor.execAndFlush();
      } catch (error) {
        console.error("Failed to flush analytics batch:", error);
      }
    }
  }

  private resetFlushTimeout() {
    this.clearFlushTimeout();
    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, this.idleTimeoutMs);
  }

  private clearFlushTimeout() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
  }

  /**
   * Simulate sending a batch of events to an external provider via HTTP POST
   */
  private async sendEventsToProvider(events: AnalyticsEvent[]): Promise<void> {
    console.log(`[Analytics] Sending batch of ${events.length} events...`);
    
    // In a real application, make a fetch() or axios request here:
    // await fetch("https://api.analytics-provider.com/v1/batch", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ events })
    // });
    
    console.log("[Analytics] Batch sent successfully.");
  }
}
```

## Usage Example

Use the batcher inside your application's route controllers or middleware:

```ts
import { AnalyticsBatcher } from "./analytics-batcher";

// Instantiate the batcher (capacity: 3 events, timeout: 3 seconds)
const batcher = new AnalyticsBatcher(3, 3000);

async function runDemo() {
  // Scenario 1: Reaching capacity (flushes immediately)
  console.log("Tracking event 1...");
  await batcher.track("user_signup", { userId: "usr_1" });

  console.log("Tracking event 2...");
  await batcher.track("page_view", { page: "/dashboard" });

  console.log("Tracking event 3...");
  // Reached capacity of 3: Should print "[Analytics] Sending batch of 3 events..."
  await batcher.track("button_click", { buttonId: "save_settings" });

  // Scenario 2: Idle timeout flush (flushes after 3 seconds)
  console.log("Tracking event 4...");
  await batcher.track("search_query", { query: "TypeScript recipes" });

  // Wait 4 seconds to observe the idle timeout flush triggering
  await new Promise((resolve) => setTimeout(resolve, 4000));
}

runDemo();
```
