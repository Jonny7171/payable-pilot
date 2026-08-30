import { Agent } from "@strands-agents/sdk";
import { ScriptedPayableModel } from "./scripted-model.js";
import { createPacketTools } from "./tools.js";
import { createStore } from "./workflow.js";

const store = createStore();
const liveSupplierResearch = Boolean(process.env.SERPAPI_API_KEY);
const agent = new Agent({
  name: "PayablePilotOfflineDemo",
  model: new ScriptedPayableModel({
    includeSupplierResearch: liveSupplierResearch,
  }),
  tools: createPacketTools(store),
  printer: false,
});

const result = await agent.invoke("Process every pending invoice packet.");

console.log(
  JSON.stringify(
    {
      proof: {
        agentRuntime: "@strands-agents/sdk",
        model: "deterministic test model",
        liveSupplierResearch,
        supplierResearchProvider: liveSupplierResearch ? "SerpApi" : null,
        completedAt: new Date().toISOString(),
      },
      response: result.lastMessage.toJSON(),
      cleared: store.list("cleared").map((packet) => packet.id),
      waitingForHuman: store.pendingReviews(),
      toolCalls: agent.messages
        .flatMap((message) => message.content)
        .filter((block) => block.type === "toolUseBlock")
        .map((block) => block.name),
      toolResults: agent.messages
        .flatMap((message) => message.content)
        .filter((block) => block.type === "toolResultBlock")
        .map((block) => block.toJSON()),
    },
    null,
    2,
  ),
);
