export interface MemoryResponse {
  memory?: string;
  error?: string;
}

export interface ProfileResponse extends MemoryResponse {
  user?: { id: string; name: string; email: string };
}

export interface TokenInfo {
  tokensUsed: number;
  tokenLimit: number;
  resetAt: string;
}

export const MAX_MEMORY_LENGTH = 200;
export const MAX_NAME_LENGTH = 80;
