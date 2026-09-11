---
title: api-handle
---

# Handle API with Handler chain

## Problem statement

If we scale up business features to a complex level, we may have to add a lot of logic to a single
API handler.

For example, when I developed APIs for a booking application, the booking entity was designed as a
state machine with states like `pending`, `confirmed`, `cancelled`, and `completed`.

For each status mutation, I had to handle at least the following logic:

1. Validating request data
2. Checking the user permissions to the API
3. Loading the booking record from the database.
4. Checking the booking's status mutation rules.
5. Checking the user permissions to the booking.
6. Updating the booking's status.
7. Publishing business events.

If we put all the logic in a single handler function, it will become very long and hard to maintain.

Even when we can split logic into different layers following up the backend framework architecture;
e.g., NestJS with serialization & validation in controller, business logic in service; it is still
too complicated. In my past experiences, I met many classes like that:

```ts
class BookingService {
  constructor(
    private readonly repository: BookingRepository,
    private readonly eventBus: EventBus,
  ) {}

  ...

  async mutateStatus(id: number, nextStatus: string) {
    const booking = await this.repository.findOneById(id);
    if (!booking) throw new NotFoundException();

    const canMutateStatus = booking.canTransitionTo(nextStatus);
    if (!canMutateStatus) throw new ForbiddenException("Cannot mutate status");

    const canUpdate = booking.canUpdateBy(user);
    if (!canUpdate) throw new ForbiddenException("Cannot update booking");

    const updater = this.repository.newUpdater().setStatus(nextStatus);
    const updateRes = await this.repository.update(id, updater);
    if (!updateRes.ok) throw new InternalServerException("Database not alive");

    this.eventBus.publish(new BookingStatusMutateEvent(updateRes.data));

    return updateRes;
  }

  ...
}
```

That `BookingService` class is a component of a very popular pattern, in which we implement a
domain controller composited with one or more domain services.

Although the service has delegated the request serialization and validation to the controller, the
mutation method still has to handle at least 5 branches.

These much of branches left several drawbacks on the scalability of logic:

- We have to write complicated unit testing for each branch.
- With 10 functions like that, we can achieve a monstrous class from 500 lines to several thousand
  lines.

There are some potentials that can make it even more complicated:

- What if for a specific status, we have to update more data to the booking entity as well?
- What if more entities get involved in the business action, which we have to update them as well?
- If the class has grown too big that we have to split it to smaller components, how do we name and
  orchestrates them?

Therefore, scaling the code "horizontally" sounds like a better idea than "vertically".

## Implementing Handlers

Instead of generalizing to a "service" term, we can be more concise in the idea:

> A domain controller can be composed of a domain handler provider.

A handler provider can be counted as a hub that provide one handler pipeline for each API.

### Defining context

A context encapsulates the input parameters, mutable state, output payload, and optional errors
passed down across steps in the pipeline.

```ts
class BookingMutationStatusContext implements IHandlerContext {
  input: {
    id: number;
    nextStatus: string;
  };
  output: Result<Booking>;
  error?: ErrorBase;

  constructor(
    input: BookingMutationStatusContext["input"],
    output: BookingMutationStatusContext["output"],
  ) {
    this.input = input;
    this.output = output;
  }
}
```

### Defining handlers

Each handler represents an isolated processing step (e.g. loading, validating, updating) that
executes its logic on the context and calls `super.handle(ctx)` to proceed to the next handler.

```ts
class BookingHandlerLoad extends Handler<BookingMutationStatusContext> {
  constructor(private readonly repository: BookingRepository) {}

  override async handle(ctx: BookingMutationStatusContext) {
    const booking = await this.repository.findOneById(ctx.input.id);
    if (!booking) {
      ctx.error = new ErrorApp("404", "Not found");
      return;
    }
    ctx.output.data = booking;

    await super.handle(ctx);
  }
}

class BookingHandlerCheck extends Handler<BookginMutationStatusContext> {
  override async handle(ctx: BookingMutationStatusContext) {
    const canMutateStatus = ctx.output.data.canTransitionTo(nextStatus);
    if (!canMutateStatus) {
      ctx.error = new ErrorApp("403", "Invalid status transition");
      return;
    }

    const canUpdate = ctx.output.data.canUpdateBy(user);
    if (!canUpdate) {
      ctx.error = new ErrorApp("403", "Cannot update booking");
      return;
    }

    await super.handle(ctx);
  }
}

class BookingHandlerUpdate extends Handler<BookingMutationStatusContext> {
  constructor(
    private readonly repository: BookingRepository,
    private readonly eventBus: EventBus,
  ) {}

  override async handle(ctx: BookingMutationStatusContext) {
    const updater = this.repository.newUpdater().setStatus(ctx.input.nextStatus);
    const updateRes = await this.repository.update(ctx.input.id, updater);
    if (!updateRes.ok) {
      ctx.error = new ErrorApp("500", "Database not alive");
      return;
    }

    this.eventBus.publish(new BookingStatusMutateEvent(updateRes.data));

    ctx.output = updateRes;

    await super.handler(ctx);
  }
}
```

### Defining handler provider

A provider acts as a domain-level factory exposing ready-to-use pipelines instantiated with the required dependencies.

```ts
class BookingHandlerProvider {
  constructor(
    private readonly repository: BookingRepository,
    private readonly eventBus: EventBus,
  ) {}

  get mutation() {
    return new HandlerPipeline<BookingMutationStatusContext>([
      new BookingHandlerLoad(this.repository),
      new BookingHandlerCheck(),
      new BookingHandlerUpdate(this.repository, this.eventBus),
    ]);
  }
}
```

## Usage example

With the handlers and pipeline encapsulated within the provider, the controller only needs to
initialize the context and delegate execution to the pipeline:

```ts
class BookingController {
  constructor(private readonly provider: BookingHandlerProvider) {}

  async mutateStatus(id: number, nextStatus: string) {
    const ctx = new BookingMutationStatusContext(
      { id, nextStatus },
      new Result({ data: new Booking() }),
    );

    await this.provider.mutation.handle(ctx);

    if (ctx.error) throw ctx.error.toHttpException();

    return ctx.output.data;
  }
}
```

## Advantages

- It keeps the controller slim and declarative.
- Each handler remains single-purposed, highly reusable, and easily testable in isolation.
- Adding new pre-conditions, steps, or side effects only requires appending a new handler to the
  pipeline without modifying existing handler logic.
- The god provider class now doesn't have to contain any business logic anymore. It just only takes
  one responsibility of composing handler pipelines, which can be easier to test and maintain.
  For instance:

  ```ts
  class BookingHandlerProvider {
    readonly mutation: HandlerPipeline<BookingMutationStatusContext>;
    readonly delete: HandlerPipeline<BookingDeleteContext>;
    readonly create: HandlerPipeline<BookingCreateContext>;
    readonly filter: HandlerPipeline<BookingFilterContext>;

    constructor(
      private readonly repository: BookingRepository,
      private readonly eventBus: EventBus,
    ) {
      this.mutation = new HandlerPipeline<BookingMutationStatusContext>([
        new BookingHandlerLoad(this.repository),
        new BookingHandlerCheck(),
        new BookingHandlerUpdate(this.repository, this.eventBus),
      ]);

      this.delete = new HandlerPipeline<BookingDeleteContext>([
        new BookingHandlerLoad(this.repository),
        new BookingHandlerCheck(),
        new BookingHandlerDelete(this.repository),
      ]);

      this.create = new HandlerPipeline<BookingCreateContext>([
        new BookingHandlerCheckConflict(this.repository),
        new BookingHandlerCreate(this.repository),
      ]);

      this.filter = new HandlerPipeline<BookingFilterContext>([
        new BookingHandlerFilterCheck(),
        new BookingHandlerFilter(this.repository),
        new BookingHandlerPopulate(this.repository),
      ]);
    }
  }
  ```
