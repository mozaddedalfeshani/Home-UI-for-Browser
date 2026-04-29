"use client";

export type MuradianAskAgentId =
  | "general"
  | "grammar"
  | "slack"
  | "deep-think"
  | "short-answer";

export interface MuradianAskAgent {
  id: MuradianAskAgentId;
  name: string;
  description: string;
  systemInstruction: string;
}

export const muradianAskAgents: MuradianAskAgent[] = [
  {
    id: "general",
    name: "Just Ask",
    description: "Simple answers for everyday questions.",
    systemInstruction:
      "Handle the user's request as a general ask-and-answer assistant.",
  },
  {
    id: "grammar",
    name: "Grammarly",
    description: "Fix grammar, tone, and clarity.",
    systemInstruction:
      "Act like a grammar and clarity editor. Improve grammar, spelling, tone, and readability while keeping the user's meaning. If the user gives text, return the polished version first, then a short note only if useful.",
  },
  {
    id: "slack",
    name: "Slack Message",
    description: "Make messages clean and work-ready.",
    systemInstruction:
      "Format the answer as a clear Slack-ready message. Keep it friendly, concise, and professional. Use simple wording and avoid long paragraphs.",
  },
  {
    id: "deep-think",
    name: "Deep Think",
    description: "Think carefully before answering.",
    systemInstruction:
      "Think carefully before answering. Check assumptions, compare options, and give a clear final answer without exposing hidden chain-of-thought.",
  },
  {
    id: "short-answer",
    name: "Fast Answer",
    description: "Quick direct answers.",
    systemInstruction:
      "Answer as briefly as possible while still being useful. Prefer one short paragraph or a few bullets.",
  },
];

export const getMuradianAskAgent = (id: MuradianAskAgentId) =>
  muradianAskAgents.find((agent) => agent.id === id) ?? muradianAskAgents[0];
