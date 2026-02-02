const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

export function log(message: string): void {
  console.error(`[openclaw-mcp] ${message}`);
}

export function logError(message: string, error?: unknown): void {
  console.error(`[openclaw-mcp] ERROR: ${message}`);
  if (error) {
    console.error(error);
  }
}

export function logDebug(message: string): void {
  if (DEBUG) {
    console.error(`[openclaw-mcp] DEBUG: ${message}`);
  }
}
