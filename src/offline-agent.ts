import { Agent } from "@strands-agents/sdk";
import { ScriptedPayableModel } from "./scripted-model.js";
import { createPacketTools } from "./tools.js";
import { createStore } from "./workflow.js";

const store = createStore();
const agent = new Agent({
  name: "PayablePilotOfflineDemo",
  model: new ScriptedPayableModel(),
  tools: createPacketTools(store),
  printer: false,
});

const result = await agent.invoke("Process every pending invoice packet.");

console.log(
  JSON.stringify(
    {
      response: result.lastMessage.toJSON(),
      cleared: store.list("cleared").map((packet) => packet.id),
      waitingForHuman: store.pendingReviews(),
      toolCalls: agent.messages
        .flatMap((message) => message.content)
        .filter((block) => block.type === "toolUseBlock")
        .map((block) => block.name),
    },
    null,
    2,
  ),
);
