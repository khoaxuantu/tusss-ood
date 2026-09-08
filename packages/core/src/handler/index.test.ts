import { describe, it } from "#test";
import { expect } from "@std/expect";
import { ErrorBase } from "../error";
import { Handler, HandlerPipeline, IHandlerContext } from "./index";

class ErrorHandler extends ErrorBase {
  override name: string = "ErrorHandler";
}

class User {
  constructor(
    public id: number,
    public name: string,
  ) {}
}

class Transaction {
  constructor(
    public id: number,
    public payee: User,
    public beneficiary: User,
    public amount: number,
    public status: "pending" | "processing" | "completed" | "failed" = "pending",
  ) {}

  canAccess(user: User) {
    return this.payee.id == user.id || this.beneficiary.id == user.id;
  }
}

class Context implements IHandlerContext {
  input: {
    id: number;
    status: "pending" | "processing" | "completed" | "failed";
  };
  output: {
    transaction: Transaction;
  };
  error?: ErrorBase | undefined;

  constructor(input: Context["input"], output: Context["output"], error?: ErrorBase) {
    this.input = input;
    this.output = output;
    this.error = error;
  }
}

class HandlerValidation extends Handler<Context> {
  async handle(ctx: Context): Promise<void> {
    if (ctx.input.id < 0) {
      ctx.error = new ErrorHandler("id", "Invalid transaction id");
    }

    if (ctx.error) return;

    super.handle(ctx);
  }
}

class HandlerUpdate extends Handler<Context> {
  async handle(ctx: Context): Promise<void> {
    ctx.output.transaction.status = ctx.input.status;

    super.handle(ctx);
  }
}

describe(Handler, () => {
  const user1 = new User(1, "User 1");
  const user2 = new User(2, "User 2");
  const pipeline = new HandlerPipeline([new HandlerValidation(), new HandlerUpdate()]);

  describe("connect", () => {
    it("should be like a chain of responsibilities", () => {
      expect(pipeline.handlers[0].next).toBeInstanceOf(HandlerUpdate);
      expect(pipeline.handlers[1].next).toBeNull();
    });
  });

  describe("handle", () => {
    it("should execute sequentially", async () => {
      const ctx = new Context(
        { id: 1, status: "processing" },
        {
          transaction: new Transaction(1, user1, user2, 100),
        },
      );

      await pipeline.handle(ctx);
      expect(ctx.output.transaction.status).toBe("processing");
    });

    it("should terminate if there is termination in handlers' member", async () => {
      const ctx = new Context(
        { id: -1, status: "processing" },
        {
          transaction: new Transaction(1, user1, user2, 100),
        },
      );

      await pipeline.handle(ctx);
      expect(ctx.output.transaction.status).toBe("pending");
      expect(ctx.error).toBeInstanceOf(ErrorHandler);
    });
  });
});
