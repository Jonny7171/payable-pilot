import { createStore, processPacket } from "./workflow.js";

const store = createStore();
const results = store.list("pending").map((packet) => processPacket(store, packet.id));

console.log(
  JSON.stringify(
    {
      processed: results.length,
      autoCleared: store.list("cleared").map((packet) => packet.id),
      needsDecision: store.pendingReviews(),
    },
    null,
    2,
  ),
);
