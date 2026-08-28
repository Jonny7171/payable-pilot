import assert from "node:assert/strict";
import test from "node:test";
import packets from "../fixtures/packets.json" with { type: "json" };
import { inspectPacket, type Packet } from "../src/domain.js";
import { createStore, processPacket } from "../src/workflow.js";

const seed = packets as Packet[];

test("calculates the independently verifiable invoice overage", () => {
  const result = inspectPacket(seed[0]!);
  assert.equal(result.clean, false);
  assert.equal(result.totalImpact, 18.4);
  assert.deepEqual(result.exceptions[0]?.evidence, {
    ordered: 10,
    invoiced: 12,
    received: 10,
    unitPrice: 9.2,
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
  processPacket(store, "PP-1042");
  processPacket(store, "PP-1043");

  assert.equal(store.list("cleared").length, 1);
  assert.equal(store.pendingReviews().length, 1);
  assert.equal(
    store.pendingReviews()[0]?.question,
    "Hold INV-44318 and request a $18.40 credit?",
  );
});
