import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createPayableAgent } from "./agent.js";

interface InvocationPayload {
  prompt?: string;
  input?: { prompt?: string };
}

async function readJson(request: IncomingMessage): Promise<InvocationPayload> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as InvocationPayload;
}

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

export function createAgentCoreServer() {
  return createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/ping") {
      json(response, 200, { status: "Healthy" });
      return;
    }

    if (request.method !== "POST" || request.url !== "/invocations") {
      json(response, 404, { error: "Not found" });
      return;
    }

    try {
      const payload = await readJson(request);
      const prompt = payload.prompt ?? payload.input?.prompt;
      if (!prompt) {
        json(response, 400, { error: "prompt must be a non-empty string" });
        return;
      }

      const { agent, store } = createPayableAgent();
      const result = await agent.invoke(prompt);
      json(response, 200, {
        result: result.lastMessage.toJSON(),
        clearedPackets: store.list("cleared").map((packet) => packet.id),
        humanReviews: store.pendingReviews(),
      });
    } catch (error: unknown) {
      json(response, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 8080);
  createAgentCoreServer().listen(port, "0.0.0.0", () => {
    console.log(`PayablePilot AgentCore runtime listening on port ${port}`);
  });
}
