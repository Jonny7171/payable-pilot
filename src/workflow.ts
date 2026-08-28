import packets from "../fixtures/packets.json" with { type: "json" };
import { inspectPacket, type Packet } from "./domain.js";
import { PacketStore } from "./store.js";

export function createStore(): PacketStore {
  return new PacketStore(packets as Packet[]);
}

export function processPacket(store: PacketStore, packetId: string) {
  const inspection = inspectPacket(store.get(packetId));
  if (inspection.clean) {
    store.clear(packetId);
    return { outcome: "cleared" as const, inspection };
  }
  return {
    outcome: "waiting_for_human" as const,
    inspection,
    review: store.queueReview(packetId, inspection),
  };
}
