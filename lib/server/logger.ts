import "server-only";

/**
 * Deliberately two levels only, and deliberately not used for routine
 * control flow (404s, validation rejections, empty query results are normal
 * outcomes, not log-worthy events) - logging is I/O and every call here is a
 * cost paid on the request path, so it's reserved for things worth paying
 * that cost for:
 *
 * - error: something broke that shouldn't have (unhandled exception, DB/
 *   upstream failure). Always worth knowing about.
 * - warn: a permission/auth check failed. Not a bug, but security-relevant -
 *   a pattern of these across requests is exactly what you'd want to notice.
 *
 * Nothing here logs on the success path. If you're tempted to log "user
 * fetched successfully" or "no results found", don't - that's every request,
 * and it drowns out the entries that actually matter.
 */
export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
}

function createConsoleLogger(): Logger {
  function emit(level: "error" | "warn", message: string, context?: Record<string, unknown>) {
    const entry = {
      level,
      message,
      time: new Date().toISOString(),
      ...context,
    };
    console[level](JSON.stringify(entry));
  }

  return {
    error(message, context) {
      emit("error", message, context);
    },
    warn(message, context) {
      emit("warn", message, context);
    },
  };
}

/**
 * The only place that knows the current logging implementation is
 * console-based. Every call site imports `logger`, never a concrete
 * implementation directly - swapping console for a real logging package or
 * a hosted service (Pino, Datadog, etc.) later means changing this one
 * function, not the ~15+ call sites across app/api/**.
 */
function createLogger(): Logger {
  return createConsoleLogger();
}

export const logger: Logger = createLogger();
