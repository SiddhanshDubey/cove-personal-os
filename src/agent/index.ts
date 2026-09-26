import { matchIntent } from "./intent";
import { getTool } from "./tool-registry";

export type AgentRequest = {
  message: string;
  timeZone?: string;
};

export type AgentResponse = {
  status: "completed" | "unsupported" | "unavailable";
  message: string;
  toolName?: string;
  data?: Record<string, string>;
};

export async function executeAgentCommand(request: AgentRequest): Promise<AgentResponse> {
  const intent = matchIntent(request.message);

  if (intent.kind === "unknown") {
    return {
      status: "unsupported",
      message: "I can currently tell you the time. Try asking, “What time is it?”",
    };
  }

  const tool = getTool(intent.toolName);
  if (!tool) {
    return {
      status: "unavailable",
      message: "That capability is not available yet.",
    };
  }

  const result = await tool.execute({ timeZone: request.timeZone });

  return {
    status: "completed",
    message: result.message,
    toolName: tool.name,
    data: result.data,
  };
}
