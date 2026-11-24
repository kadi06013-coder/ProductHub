import { HttpErrorResponse } from '@angular/common/http';

/**
 * Turns an API error into a message that can be shown to the user:
 * Joi validation errors (400) are listed, otherwise the API message is used.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;
  if (err.status === 0) return 'Serveur injoignable. Vérifiez que l’API est démarrée.';

  const body = err.error as { message?: string; errors?: string[] } | null;
  if (body?.errors?.length) return body.errors.join(' · ');
  return body?.message || fallback;
}
