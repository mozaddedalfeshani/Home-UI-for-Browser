export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface TokenUsage {
  tokensUsed: number;
  tokenLimit: number | null;
  resetAt: string | null;
}

export interface MuradianAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
