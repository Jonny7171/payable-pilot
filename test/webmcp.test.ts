import assert from "node:assert/strict";
import test from "node:test";

import {
  decisionDraftResult,
  payablePilotQueue,
  queueReviewResult,
} from "../src/webmcp";

test("queue review exposes the exact deterministic exception", () => {
  const result = queueReviewResult(null);

  assert.equal(result.status, "human_review_required");
  assert.equal(result.exception.packetId, "PP-2086");
  assert.equal(result.exception.totalDifference, 200);
  assert.match(result.exception.evidence, /8 units/);
  assert.match(result.exception.evidence, /\$119/);
  assert.match(result.control, /Only a person can confirm/);
  assert.equal(
    payablePilotQueue.quantity * payablePilotQueue.differencePerUnit,
    payablePilotQueue.totalDifference,
  );
});

test("decision staging never reports a completed action", () => {
  const result = decisionDraftResult("request_credit_and_hold");

  assert.equal(result.status, "awaiting_human_confirmation");
  assert.equal(result.action, "request_credit_and_hold");
  assert.match(result.control, /Nothing was approved or sent/);
});

test("decision staging rejects actions outside the visible choices", () => {
  assert.throws(
    () => decisionDraftResult("send_supplier_email"),
    /Choose request_credit_and_hold or approve_payment_override/,
  );
});
