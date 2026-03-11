import * as Sentry from '@sentry/nextjs';

/**
 * Log an error message to Sentry with structured context.
 * Use alongside Sentry.captureException for thrown errors.
 */
export function logError(
  area: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  Sentry.withScope((scope) => {
    scope.setTag('area', area);
    if (context && Object.keys(context).length > 0) {
      scope.setContext('extra', context);
    }
    Sentry.captureMessage(message, 'error');
  });
}

/**
 * Log a warning to Sentry with structured context.
 */
export function logWarn(
  area: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  Sentry.withScope((scope) => {
    scope.setTag('area', area);
    if (context && Object.keys(context).length > 0) {
      scope.setContext('extra', context);
    }
    Sentry.captureMessage(message, 'warning');
  });
}
