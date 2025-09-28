export type AiGenerationErrorCode = 'SERVICE_DISABLED' | 'UNKNOWN';

export class AiGenerationError extends Error {
  public readonly code: AiGenerationErrorCode;
  public readonly originalError?: unknown;

  constructor(message: string, code: AiGenerationErrorCode = 'UNKNOWN', originalError?: unknown) {
    super(message);
    this.name = 'AiGenerationError';
    this.code = code;
    this.originalError = originalError;
  }
}

const SERVICE_DISABLED_MARKERS = ['SERVICE_DISABLED', '403 FORBIDDEN'];

export function isServiceDisabledError(error: unknown): boolean {
  if (error instanceof AiGenerationError) {
    return error.code === 'SERVICE_DISABLED';
  }

  if (typeof error === 'string') {
    return SERVICE_DISABLED_MARKERS.some((marker) => error.toUpperCase().includes(marker));
  }

  if (error && typeof error === 'object') {
    const maybeCode = 'code' in error ? (error as { code?: string }).code : undefined;
    if (typeof maybeCode === 'string' && SERVICE_DISABLED_MARKERS.some((marker) => maybeCode.toUpperCase().includes(marker))) {
      return true;
    }

    const maybeMessage = 'message' in error ? (error as { message?: unknown }).message : undefined;
    if (typeof maybeMessage === 'string') {
      return SERVICE_DISABLED_MARKERS.some((marker) => maybeMessage.toUpperCase().includes(marker));
    }
  }

  return false;
}

export function getReadableErrorMessage(error: unknown, fallback = "Une erreur inattendue est survenue."): string {
  if (error instanceof AiGenerationError) {
    return error.message;
  }

  if (error instanceof Error && typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return fallback;
}
