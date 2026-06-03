import { IModel } from "../model";
import { ClassProperties } from "../types";

export class ErrorBase extends Error implements IModel<ErrorBase> {
  readonly name: string = "ErrorBase";
  /**
   * The user's defined error code. It can be varied depending on the application needs.
   */
  readonly code: string;

  /**
   * The error message
   */
  readonly message: string;

  /**
   * The customized cause of the error.
   */
  readonly cause?: string;

  /**
   * The stack trace of the error.
   */
  readonly stack!: string;

  constructor(code: string, message: string, opt?: { cause?: string }) {
    super();

    this.message = message;
    this.code = code;
    this.cause = opt?.cause;

    Error.captureStackTrace(this, ErrorBase);
  }

  toStruct(): ClassProperties<ErrorBase> {
    return {
      code: this.code,
      message: this.message,
      name: this.name,
      cause: this.cause,
      stack: this.stack,
    };
  }

  toJSON(): ClassProperties<ErrorBase> {
    return this.toStruct();
  }
}
