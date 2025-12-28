import { toast } from '@/hooks/use-toast';

/**
 * Error types for better classification
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  details?: any;
  timestamp: Date;
  userMessage: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    this.userMessage = this.getUserFriendlyMessage();
  }

  private getUserFriendlyMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      case ErrorType.VALIDATION:
        return 'Os dados fornecidos são inválidos. Verifique e tente novamente.';
      case ErrorType.AUTHORIZATION:
        return 'Você não tem permissão para realizar esta ação.';
      case ErrorType.NOT_FOUND:
        return 'O recurso solicitado não foi encontrado.';
      case ErrorType.CONFLICT:
        return 'Conflito detectado. O recurso já existe ou está em uso.';
      case ErrorType.SERVER:
        return 'Erro no servidor. Tente novamente em alguns instantes.';
      case ErrorType.CLIENT:
        return 'Erro na solicitação. Verifique os dados e tente novamente.';
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      userMessage: this.userMessage,
    };
  }
}

/**
 * Error handler service
 */
class ErrorHandlerService {
  private errorLog: AppError[] = [];
  private readonly MAX_LOG_SIZE = 100;

  /**
   * Handle and classify errors
   */
  handle(error: unknown, context?: string): AppError {
    const appError = this.classify(error);
    
    // Log error
    this.log(appError, context);
    
    // Show user notification
    this.notify(appError, context);
    
    return appError;
  }

  /**
   * Classify error into AppError
   */
  private classify(error: unknown): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new AppError(
        'Network request failed',
        ErrorType.NETWORK,
        undefined,
        error
      );
    }

    // Supabase errors
    if (this.isSupabaseError(error)) {
      return this.handleSupabaseError(error as any);
    }

    // Standard Error
    if (error instanceof Error) {
      return new AppError(
        error.message,
        ErrorType.UNKNOWN,
        undefined,
        { stack: error.stack }
      );
    }

    // Unknown error
    return new AppError(
      'An unknown error occurred',
      ErrorType.UNKNOWN,
      undefined,
      error
    );
  }

  /**
   * Check if error is from Supabase
   */
  private isSupabaseError(error: any): boolean {
    return error && (
      error.code !== undefined ||
      error.status !== undefined ||
      error.statusCode !== undefined
    );
  }

  /**
   * Handle Supabase-specific errors
   */
  private handleSupabaseError(error: any): AppError {
    const statusCode = error.status || error.statusCode;
    
    // Authentication errors
    if (statusCode === 401 || error.code === 'PGRST301') {
      return new AppError(
        error.message || 'Authentication required',
        ErrorType.AUTHORIZATION,
        401,
        error
      );
    }

    // Forbidden
    if (statusCode === 403) {
      return new AppError(
        error.message || 'Access forbidden',
        ErrorType.AUTHORIZATION,
        403,
        error
      );
    }

    // Not found
    if (statusCode === 404 || error.code === 'PGRST116') {
      return new AppError(
        error.message || 'Resource not found',
        ErrorType.NOT_FOUND,
        404,
        error
      );
    }

    // Conflict (duplicate, constraint violation)
    if (statusCode === 409 || error.code === '23505') {
      return new AppError(
        error.message || 'Resource already exists',
        ErrorType.CONFLICT,
        409,
        error
      );
    }

    // Validation error
    if (statusCode === 400 || error.code === '22P02') {
      return new AppError(
        error.message || 'Invalid data',
        ErrorType.VALIDATION,
        400,
        error
      );
    }

    // Server errors
    if (statusCode >= 500) {
      return new AppError(
        error.message || 'Server error',
        ErrorType.SERVER,
        statusCode,
        error
      );
    }

    // Default client error
    return new AppError(
      error.message || 'Request failed',
      ErrorType.CLIENT,
      statusCode,
      error
    );
  }

  /**
   * Log error to console and storage
   */
  private log(error: AppError, context?: string): void {
    // Add to in-memory log
    this.errorLog.push(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog.shift();
    }

    // Console log with context
    const logMessage = context 
      ? `[${context}] ${error.type}: ${error.message}`
      : `${error.type}: ${error.message}`;
    
    console.error(logMessage, {
      type: error.type,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: error.timestamp,
    });

    // Could also send to external logging service
    this.sendToLoggingService(error, context);
  }

  /**
   * Show user-friendly notification
   */
  private notify(error: AppError, context?: string): void {
    const title = context ? `Erro: ${context}` : 'Erro';
    
    toast({
      title,
      description: error.userMessage,
      variant: 'destructive',
    });
  }

  /**
   * Send error to external logging service (placeholder)
   */
  private sendToLoggingService(error: AppError, context?: string): void {
    // In production, send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging API
    
    // For now, just a placeholder
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToSentry(error, context);
    }
  }

  /**
   * Get error log
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify(
      this.errorLog.map(error => error.toJSON()),
      null,
      2
    );
  }
}

/**
 * Async error boundary wrapper
 */
export async function withErrorHandler<T>(
  operation: () => Promise<T>,
  context?: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    errorHandler.handle(error, context);
    return fallback;
  }
}

/**
 * Sync error boundary wrapper
 */
export function withErrorHandlerSync<T>(
  operation: () => T,
  context?: string,
  fallback?: T
): T | undefined {
  try {
    return operation();
  } catch (error) {
    errorHandler.handle(error, context);
    return fallback;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandlerService();
