import assert from "node:assert/strict";
import test from "node:test";
import { createPayableModel, selectedModelProvider } from "../src/model.js";

test("configures the guarded Nebius Token Factory model", () => {
  const priorProvider = process.env.PAYABLE_MODEL_PROVIDER;
  const priorKey = process.env.NEBIUS_API_KEY;

  process.env.PAYABLE_MODEL_PROVIDER = "nebius";
  process.env.NEBIUS_API_KEY = "test-key";

  try {
    const model = createPayableModel();
    assert.equal(selectedModelProvider(), "nebius");
    assert.equal(model.getConfig().modelId, "nvidia/nemotron-3-super-120b-a12b");
    assert.equal(model.getConfig().maxTokens, 900);
  } finally {
    if (priorProvider === undefined) delete process.env.PAYABLE_MODEL_PROVIDER;
    else process.env.PAYABLE_MODEL_PROVIDER = priorProvider;

    if (priorKey === undefined) delete process.env.NEBIUS_API_KEY;
    else process.env.NEBIUS_API_KEY = priorKey;
  }
});
