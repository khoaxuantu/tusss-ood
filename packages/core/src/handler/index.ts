import { ErrorBase } from "../error";

/**
 * Represents the execution context passed between handlers in a chain of responsibility.
 *
 * @template TInput - The type of the input data. Defaults to `any`.
 * @template TOutput - The type of the output data. Defaults to `any`.
 */
export interface IHandlerContext<TInput = any, TOutput = any> {
  /**
   * The input payload provided to the chain.
   */
  input: TInput;

  /**
   * The output data produced or modified along the chain.
   */
  output: TOutput;

  /**
   * An optional error instance indicating a failure or triggering termination in the chain.
   */
  error?: ErrorBase;
}

/**
 * An abstract base class implementing the Chain of Responsibility design pattern.
 *
 * Handlers can process incoming context, mutate output, flag errors, and forward
 * execution to the next handler in the chain.
 *
 * @template TContext - The context type extending {@link IHandlerContext}. Defaults to {@link IHandlerContext}.
 *
 * @example
 * Chaining a validation handler and an update handler through a shared context
 * ```ts
 * class OrderContext implements IHandlerContext {
 *   input: { orderId: string; amount: number };
 *   output: { status: string };
 *   error?: ErrorBase;
 *
 *   constructor(
 *     input: OrderContext["input"],
 *     output: OrderContext["output"],
 *     error?: ErrorBase,
 *   ) {
 *     this.input = input;
 *     this.output = output;
 *     this.error = error;
 *   }
 * }
 *
 * class ErrorApp extends ErrorBase {
 *   override name: string = "ErrorApp";
 * }
 *
 * class ValidationHandler extends Handler<OrderContext> {
 *   override async handle(ctx: OrderContext) {
 *     if (ctx.input.amount <= 0) {
 *       ctx.error = new ErrorApp("VALIDATION_ERROR", "Amount must be positive");
 *       return; // Stop chain propagation on error
 *     }
 *     await super.handle(ctx);
 *   }
 * }
 *
 * class ProcessOrderHandler extends Handler<OrderContext> {
 *   override async handle(ctx: OrderContext) {
 *     ctx.output.status = "processed";
 *     await super.handle(ctx);
 *   }
 * }
 *
 * const validator = new ValidationHandler();
 * const processor = new ProcessOrderHandler();
 * Handler.connect([validator, processor]);
 *
 * const context = new OrderContext(
 *   { orderId: "ORD-123", amount: 100 },
 *   { status: "pending" },
 * );
 *
 * await validator.handle(context);
 * console.log(context.output.status); // "processed"
 * ```
 *
 * @example
 * Authentication and request logging pipeline
 * ```ts
 * class RequestContext implements IHandlerContext {
 *   input: { token?: string; path: string };
 *   output: { authenticated: boolean };
 *   error?: ErrorBase;
 *
 *   constructor(
 *     input: RequestContext["input"],
 *     output: RequestContext["output"],
 *     error?: ErrorBase,
 *   ) {
 *     this.input = input;
 *     this.output = output;
 *     this.error = error;
 *   }
 * }
 *
 * class ErrorApp extends ErrorBase {
 *   override name: string = "ErrorApp";
 * }
 *
 * class LoggerHandler extends Handler<RequestContext> {
 *   override async handle(ctx: RequestContext) {
 *     console.log(`Incoming request to ${ctx.input.path}`);
 *     await super.handle(ctx);
 *   }
 * }
 *
 * class AuthHandler extends Handler<RequestContext> {
 *   override async handle(ctx: RequestContext) {
 *     if (!ctx.input.token) {
 *       ctx.error = new ErrorApp("UNAUTHORIZED", "Missing authentication token");
 *       return;
 *     }
 *     ctx.output.authenticated = true;
 *     await super.handle(ctx);
 *   }
 * }
 *
 * const logger = new LoggerHandler();
 * const auth = new AuthHandler();
 * Handler.connect([logger, auth]);
 *
 * const ctx = new RequestContext(
 *   { path: "/api/dashboard", token: "secret-token" },
 *   { authenticated: false },
 * );
 *
 * await logger.handle(ctx);
 * console.log(ctx.output.authenticated); // true
 * ```
 */
export abstract class Handler<TContext extends IHandlerContext = IHandlerContext> {
  /**
   * Links a list of handlers sequentially by setting each handler's {@link next} property
   * to the subsequent handler in the array.
   *
   * @param handlers - An array of handlers to connect in sequence.
   */
  static connect(handlers: Handler[]) {
    for (let i = 0; i < handlers.length - 1; i++) {
      handlers[i].next = handlers[i + 1];
    }
  }

  /**
   * The next handler in the chain of responsibility, or `null` if this handler is the last in the chain.
   */
  next: Handler<TContext> | null = null;

  /**
   * Executes processing for the current handler and delegates execution to the next handler in the chain, if present.
   *
   * @param ctx - The execution context passed along the chain.
   * @returns A promise that resolves when this handler and any subsequent handlers complete.
   */
  async handle(ctx: TContext) {
    await this.next?.handle(ctx);
  }
}

/**
 * A helper class to provide pipeline interface for handlers.
 *
 * @template TContext - The context type extending {@link IHandlerContext}.
 */
export class HandlerPipeline<TContext extends IHandlerContext = IHandlerContext> {
  /**
   * Creates a new handler pipeline. The constructor will connect the handlers in sequence.
   *
   * @param handlers - An array of handlers to connect in sequence.
   */
  constructor(readonly handlers: Handler<TContext>[]) {
    Handler.connect(this.handlers);
  }

  /**
   * Executes the pipeline by invoking the first handler in the chain.
   *
   * @param ctx - The execution context passed along the chain.
   * @returns A promise that resolves when this pipeline and any subsequent handlers complete.
   */
  async handle(ctx: TContext) {
    await this.handlers[0]?.handle(ctx);
    return ctx;
  }
}
