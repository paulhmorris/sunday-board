import * as Sentry from "@sentry/sveltekit";

type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

type Attributes = Record<string, unknown>;

export class Logger {
  constructor(private readonly module: string) {}

  private log(level: LogLevel, message: string, attributes?: Attributes) {
    Sentry.logger[level](message, { module: this.module, ...attributes });
  }

  trace(message: string, attributes?: Attributes) {
    this.log("trace", message, attributes);
  }

  debug(message: string, attributes?: Attributes) {
    this.log("debug", message, attributes);
  }

  info(message: string, attributes?: Attributes) {
    this.log("info", message, attributes);
  }

  warn(message: string, attributes?: Attributes) {
    this.log("warn", message, attributes);
  }

  error(message: string, attributes?: Attributes) {
    this.log("error", message, attributes);
  }

  fatal(message: string, attributes?: Attributes) {
    this.log("fatal", message, attributes);
  }
}
