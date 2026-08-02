/**
 * Client-side mirror of lib/server/logger.ts's policy: error/warn only, no
 * verbose logging of routine outcomes. Kept as a separate module (not
 * shared with the server one) since the server logger is `server-only` and
 * can't be imported into a "use client" component.
 *
 * Same factory shape as the server logger, for the same reason: swapping
 * console for a real client-side error-reporting service later means
 * changing createLogger() here, not every call site.
 */
export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
}

function createConsoleLogger(): Logger {
  return {
    error(message, context) {
      console.error(message, context ?? "");
    },
    warn(message, context) {
      console.warn(message, context ?? "");
    },
  };
}

function createLogger(): Logger {
  return createConsoleLogger();
}

export const logger: Logger = createLogger();
