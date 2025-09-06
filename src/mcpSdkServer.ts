// src/mcpSdkServer.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "node:path";
import { parseResume, answerQuestion } from "./resumePaser.ts";
import { sendEmail } from "./email.ts";

export async function startMcpSdkServer(resumePath: string) {
  // Load resume at startup (deterministic)
  const resume = parseResume(resumePath);

  const server = new McpServer({
    name: "mcp-resume-server",
    version: "0.1.0",
  });

  // Tool: ask_resume
  server.tool(
    "ask_resume",
    {
      question: z.string().min(1),
      resume: z.object(resume),
    }, // Corrected from z.objext to z.object
    async (input, _requestInfo) => {
      const { resume: parsedResume, question } = z
        .object({ resume: z.object(resume), question: z.string().min(1) })
        .parse(input);
      const answer = await answerQuestion(resume, question);
      return {
        content: [{ type: "text", text: answer }],
      };
    }
  );

  // Tool: send_email
  server.tool(
    "send_email",
    {
      to: z.string().min(1),
      subject: z.string().min(1),
      body: z.string().min(1),
    },
    async (input, _requestInfo) => {
      const result = await sendEmail(
        z
          .object({
            to: z.string().min(1),
            subject: z.string().min(1),
            body: z.string().min(1),
          })
          .parse(input)
      );
      return {
        content: [
          {
            type: "text",
            text: result.ok
              ? `Email sent! id=${result.messageId}`
              : `Error: ${String(result.error)}`,
          },
        ],
      };
    }
  );

  // Start stdio transport (MCP clients expect stdio or streamable-http)
  const transport = new StdioServerTransport();
  console.log("MCP (SDK) server starting on stdio...");
  await server.connect(transport);
  // server.connect blocks until transport stops, per SDK behavior
}
