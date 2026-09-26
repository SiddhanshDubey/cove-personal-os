import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { executeAgentCommand } from "@/agent";

const agentRequestSchema = z.object({
  message: z.string().trim().min(1).max(280),
  timeZone: z.string().trim().min(1).max(100).optional(),
});

export const runAgentCommand = createServerFn({ method: "POST" })
  .validator(agentRequestSchema)
  .handler(async ({ data }) => executeAgentCommand(data));
