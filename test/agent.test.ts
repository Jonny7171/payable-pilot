import assert from "node:assert/strict";
import test from "node:test";
import { Agent } from "@strands-agents/sdk";
import { ScriptedPayableModel } from "../src/scripted-model.js";
import { createPacketTools } from "../src/tools.js";
import { createStore } from "../src/workflow.js";

test("executes the complete workflow through the Strands agent loop", async () => {
  const store = createStore();
  const agent = new Agent({
    model: new ScriptedPayableModel(),
    tools: createPacketTools(store),
    printer: false,
  });

  const result = await agent.invoke("Process every pending invoice packet.");

  assert.deepEqual(store.list("cleared").map((packet) => packet.id), ["PP-2087"]);
  assert.equal(store.pendingReviews().length, 1);
  assert.equal(store.pendingReviews()[0]?.inspection.totalImpact, 200);
  assert.match(JSON.stringify(result.lastMessage.toJSON()), /needs one decision/);

  const toolCalls = agent.messages
    .flatMap((message) => message.content)
    .filter((block) => block.type === "toolUseBlock")
    .map((block) => block.name);

  assert.deepEqual(toolCalls, [
    "list_pending_packets",
    "inspect_invoice_packet",
    "queue_human_review",
    "inspect_invoice_packet",
    "clear_clean_packet",
  ]);
});

test("uses live supplier research before escalating an exception when enabled", async () => {
  const originalKey = process.env.SERPAPI_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.SERPAPI_API_KEY = "test-key";
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        search_metadata: { id: "test-search", status: "Success" },
        organic_results: [],
        news_results: [],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );

  try {
    const store = createStore();
    const agent = new Agent({
      model: new ScriptedPayableModel({ includeSupplierResearch: true }),
      tools: createPacketTools(store),
      printer: false,
    });

    await agent.invoke("Process every pending invoice packet.");

    const toolCalls = agent.messages
      .flatMap((message) => message.content)
      .filter((block) => block.type === "toolUseBlock")
      .map((block) => block.name);

    assert.deepEqual(toolCalls.slice(0, 3), [
      "list_pending_packets",
      "inspect_invoice_packet",
      "research_supplier_risk",
    ]);
    assert.equal(store.pendingReviews().length, 1);
    assert.deepEqual(store.list("cleared").map((packet) => packet.id), ["PP-2087"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.SERPAPI_API_KEY;
    else process.env.SERPAPI_API_KEY = originalKey;
  }
});
