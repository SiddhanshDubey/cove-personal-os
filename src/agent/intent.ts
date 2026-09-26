export type AgentIntent =
  | { kind: "tool"; toolName: "get_current_time" }
  | { kind: "unknown" };

const currentTimePatterns = [
  /\bwhat(?:'s| is) (?:the )?time\b/i,
  /\btime is it\b/i,
  /\b(?:current|local) time\b/i,
  /\btime now\b/i,
  /\bclock\b/i,
];

export function matchIntent(message: string): AgentIntent {
  const normalizedMessage = message.trim().replace(/\s+/g, " ");

  if (currentTimePatterns.some((pattern) => pattern.test(normalizedMessage))) {
    return { kind: "tool", toolName: "get_current_time" };
  }

  return { kind: "unknown" };
}
