import { getCurrentTimeTool } from "./tools/get-current-time";

export type ToolContext = {
  timeZone?: string;
};

export type ToolResult = {
  message: string;
  data: Record<string, string>;
};

export type AgentTool = {
  name: string;
  execute: (context: ToolContext) => ToolResult | Promise<ToolResult>;
};

const toolsByName = new Map<string, AgentTool>([[getCurrentTimeTool.name, getCurrentTimeTool]]);

export function getTool(name: string): AgentTool | undefined {
  return toolsByName.get(name);
}

export function listTools(): AgentTool[] {
  return [...toolsByName.values()];
}
