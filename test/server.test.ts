import assert from "node:assert/strict";
import test from "node:test";
import type { AddressInfo } from "node:net";
import { createAgentCoreServer } from "../src/server.js";

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const server = createAgentCoreServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test("serves a deterministic decision for Kong to meter", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/decisions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ packetId: "PP-1042" }),
    });
    const result = (await response.json()) as {
      decision: string;
      requiresHuman: boolean;
      inspection: { totalImpact: number };
    };

    assert.equal(response.status, 200);
    assert.equal(result.decision, "REVIEW");
    assert.equal(result.requiresHuman, true);
    assert.equal(result.inspection.totalImpact, 18.4);
  });
});

test("rejects a decision request without a packet ID", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/decisions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "packetId must be a non-empty string",
    });
  });
});
