export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface TokenUsage {
  tokensUsed: number;
  tokenLimit: number;
  resetAt: string;
}

export interface MuradianAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
