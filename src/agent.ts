import { Agent } from "@strands-agents/sdk";
import { createPayableModel, selectedModelProvider } from "./model.js";
import { createStore } from "./workflow.js";
import { createPacketTools } from "./tools.js";

export function createPayableAgent() {
  const store = createStore();
  const model = createPayableModel();

  const agent = new Agent({
    name: "PayablePilot",
    model,
    tools: createPacketTools(store),
    printer: false,
    systemPrompt: `You run the invoice exception desk.

Process every pending packet end to end:
1. List pending packets.
2. Inspect each packet with the deterministic matching tool.
3. Clear a packet only when inspection says it is clean.
4. When an exception exists and the supplier research tool is available, use it before queuing review.
5. Queue exactly one human review question for each exception packet.

Never invent evidence or dollar amounts. Never approve a payment or vendor action on a human's behalf. Finish routine work quietly and report only packets that need a decision.`,
  });

  return { agent, store };
}

async function main() {
  const { agent, store } = createPayableAgent();
  const result = await agent.invoke(
    "Process all pending invoice packets. Return a compact exception report.",
  );
  console.log(`Model provider: ${selectedModelProvider()}`);
  console.log(result.lastMessage);
  console.log(JSON.stringify({ pendingReviews: store.pendingReviews() }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
