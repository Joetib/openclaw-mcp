import { OpenClawConnectionError, OpenClawApiError } from '../utils/errors.js';
import type {
  OpenClawHealthResponse,
  OpenClawChatResponse,
  OpenClawSessionsResponse,
  OpenClawHistoryResponse,
  OpenClawMemoryResponse,
} from './types.js';

export class OpenClawClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new OpenClawApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof OpenClawApiError) {
        throw error;
      }
      throw new OpenClawConnectionError(
        `Failed to connect to OpenClaw at ${this.baseUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async health(): Promise<OpenClawHealthResponse> {
    return this.request<OpenClawHealthResponse>('/health');
  }

  async chat(message: string, sessionId?: string): Promise<OpenClawChatResponse> {
    return this.request<OpenClawChatResponse>('/api/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        sessionKey: sessionId,
      }),
    });
  }

  async getSessions(channel?: string): Promise<OpenClawSessionsResponse> {
    const params = channel ? `?channel=${encodeURIComponent(channel)}` : '';
    return this.request<OpenClawSessionsResponse>(`/api/sessions${params}`);
  }

  async getHistory(sessionId: string, limit = 50): Promise<OpenClawHistoryResponse> {
    return this.request<OpenClawHistoryResponse>(
      `/api/sessions/${encodeURIComponent(sessionId)}/history?limit=${limit}`
    );
  }

  async memoryGet(key: string): Promise<OpenClawMemoryResponse> {
    return this.request<OpenClawMemoryResponse>(`/api/memory/${encodeURIComponent(key)}`);
  }

  async memorySet(key: string, value: string): Promise<OpenClawMemoryResponse> {
    return this.request<OpenClawMemoryResponse>('/api/memory', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  async memorySearch(query: string): Promise<OpenClawMemoryResponse> {
    return this.request<OpenClawMemoryResponse>(
      `/api/memory/search?q=${encodeURIComponent(query)}`
    );
  }
}
