import assert from "node:assert/strict";
import test from "node:test";
import packets from "../fixtures/packets.json" with { type: "json" };
import { inspectPacket, type Packet } from "../src/domain.js";
import { createStore, processPacket } from "../src/workflow.js";

const seed = packets as Packet[];

test("calculates the independently verifiable unit-price variance", () => {
  const result = inspectPacket(seed[0]!);
  assert.equal(result.clean, false);
  assert.equal(result.totalImpact, 200);
  assert.equal(result.exceptions[0]?.code, "UNIT_PRICE_VARIANCE");
  assert.deepEqual(result.exceptions[0]?.evidence, {
    ordered: 8,
    invoiced: 8,
    received: 8,
    orderedUnitPrice: 94,
    invoiceUnitPrice: 119,
  });
});

test("clears a packet when all three documents agree", () => {
  const result = inspectPacket(seed[1]!);
  assert.equal(result.clean, true);
  assert.equal(result.totalImpact, 0);
  assert.equal(result.recommendedAction, "CLEAR_FOR_PAYMENT");
});

test("routes only the exception to a person", () => {
  const store = createStore();
  processPacket(store, "PP-2086");
  processPacket(store, "PP-2087");

  assert.equal(store.list("cleared").length, 1);
  assert.equal(store.pendingReviews().length, 1);
  assert.equal(
    store.pendingReviews()[0]?.question,
    "Hold INV-25791 and request a $200.00 credit?",
  );
});
