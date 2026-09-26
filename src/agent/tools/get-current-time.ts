import type { AgentTool } from "../tool-registry";

function resolveTimeZone(requestedTimeZone?: string): string {
  if (requestedTimeZone) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: requestedTimeZone });
      return requestedTimeZone;
    } catch {
      // Fall through to the server's time zone when the client sends an invalid value.
    }
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
}

export const getCurrentTimeTool: AgentTool = {
  name: "get_current_time",
  execute: ({ timeZone }) => {
    const now = new Date();
    const resolvedTimeZone = resolveTimeZone(timeZone);
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      timeZone: resolvedTimeZone,
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(now);

    return {
      message: "It is " + formattedTime + ".",
      data: {
        isoTime: now.toISOString(),
        time: formattedTime,
        timeZone: resolvedTimeZone,
      },
    };
  },
};
