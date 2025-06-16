/**
 * Safely gets the error message from any error-like object
 * Avoids instanceof Error issues that can occur in certain environments
 */
export function getErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
    if (!error) return fallback;

    // Check if it's an object with a message property
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message: unknown }).message;
        if (typeof message === 'string') {
            return message;
        }
    }

    // Check if it's a string
    if (typeof error === 'string') {
        return error;
    }

    // Try to convert to string as last resort
    try {
        return String(error);
    } catch {
        return fallback;
    }
}

/**
 * Creates a safe error handler function for try-catch blocks
 */
export function createErrorHandler(fallback: string = 'An error occurred') {
    return (error: unknown) => getErrorMessage(error, fallback);
}

/**
 * Safe error class that works even when Error constructor is not available
 */
export function createError(message: string): unknown {
    try {
        return new Error(message);
    } catch {
        // Fallback if Error constructor is not available
        return { message, name: 'Error', toString: () => message };
    }
} 