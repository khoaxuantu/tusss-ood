---
title: notification-factory
---

# Notification Dispatcher with Factory & FactoryDirector

In large applications, you often need to create instances of different service implementations depending on incoming payloads or business logic parameters. For example, a notification engine might dispatch email, SMS, or Slack alerts.

Rather than writing large, hard-to-maintain `switch` or `if/else` statements, you can use the Factory pattern.

The `@tusss/ood` package provides three core building blocks to structure this pattern:
1. `FactoryMaterial`: Encapsulates the configuration parameters and type identifier needed to build a product.
2. `Factory`: Represents a creator that knows how to build a product using a specific material.
3. `FactoryDirector`: Orchestrates the dispatching logic, dynamically resolving which factory constructor to invoke based on the material's type.

This recipe details how to build an extensible notification dispatcher using these classes.

## 1. Define Notification Materials

Materials carry the parameters required to build the respective notification channels.

```ts
import { FactoryMaterial } from "@tusss/ood";

export type NotificationType = "email" | "sms" | "slack";

export class EmailMaterial extends FactoryMaterial<NotificationType> {
  override readonly type: NotificationType = "email";

  constructor(
    readonly recipient: string,
    readonly subject: string,
    readonly body: string
  ) {
    super();
  }
}

export class SMSMaterial extends FactoryMaterial<NotificationType> {
  override readonly type: NotificationType = "sms";

  constructor(
    readonly phoneNumber: string,
    readonly message: string
  ) {
    super();
  }
}

export class SlackMaterial extends FactoryMaterial<NotificationType> {
  override readonly type: NotificationType = "slack";

  constructor(
    readonly channelUrl: string,
    readonly text: string
  ) {
    super();
  }
}
```

## 2. Define the Common Product Interface

Every channel created by the factories must implement a common interface so they can be treated polymorphically:

```ts
export interface NotificationChannel {
  send(): Promise<void>;
}
```

## 3. Implement Channel Factories

Each factory is responsible for extracting configuration from its material and returning a corresponding `NotificationChannel` product.

```ts
import { Factory } from "@tusss/ood";
import { NotificationChannel } from "./channel.interface";
import { EmailMaterial, SMSMaterial, SlackMaterial } from "./materials";

export class EmailChannelFactory extends Factory<NotificationChannel> {
  override create(): NotificationChannel {
    // Cast the material to retrieve its specific properties
    const material = this.material as EmailMaterial;
    
    return {
      send: async () => {
        console.log(`[Email] Sending "${material.subject}" to ${material.recipient}...`);
      },
    };
  }
}

export class SMSChannelFactory extends Factory<NotificationChannel> {
  override create(): NotificationChannel {
    const material = this.material as SMSMaterial;
    
    return {
      send: async () => {
        console.log(`[SMS] Sending "${material.message}" to ${material.phoneNumber}...`);
      },
    };
  }
}

export class SlackChannelFactory extends Factory<NotificationChannel> {
  override create(): NotificationChannel {
    const material = this.material as SlackMaterial;
    
    return {
      send: async () => {
        console.log(`[Slack] Posting message to webhook: ${material.channelUrl}...`);
      },
    };
  }
}
```

## 4. Orchestrate with FactoryDirector

Create a `NotificationDirector` class that registers all the available factories in its registry cluster:

```ts
import { FactoryDirector, FactoryMaterial, Factory } from "@tusss/ood";
import { NotificationChannel } from "./channel.interface";
import { NotificationType } from "./materials";
import { EmailChannelFactory, SMSChannelFactory, SlackChannelFactory } from "./factories";

export class NotificationDirector extends FactoryDirector<NotificationChannel> {
  // Map each notification type to its respective Factory constructor
  override readonly cluster = new Map<
    NotificationType,
    new (material: FactoryMaterial) => Factory<NotificationChannel>
  >([
    ["email", EmailChannelFactory],
    ["sms", SMSChannelFactory],
    ["slack", SlackChannelFactory],
  ]);
}
```

## 5. Usage Example

Instantiate the director and send notifications transparently using any material:

```ts
import { NotificationDirector } from "./notification.director";
import { EmailMaterial, SlackMaterial, SMSMaterial } from "./materials";

const director = new NotificationDirector();

async function notifyUsers() {
  // Prepare different materials
  const payloads = [
    new EmailMaterial("user@example.com", "Welcome!", "Thanks for signing up."),
    new SMSMaterial("+15550199", "Your auth code is 482910"),
    new SlackMaterial("https://hooks.slack.com/services/...", "New deployment succeeded!"),
  ];

  for (const material of payloads) {
    // The director looks up the correct factory, instantiates it, and returns the channel
    const channel = director.create(material);
    
    // Send notification
    await channel.send();
  }
}

notifyUsers();
```
