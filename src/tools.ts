import { tool } from "@strands-agents/sdk";
import { z } from "zod";
import { inspectPacket } from "./domain.js";
import type { PacketStore } from "./store.js";
import { researchVendor } from "./vendor-intel.js";

export function createPacketTools(store: PacketStore) {
  const listPendingPackets = tool({
    name: "list_pending_packets",
    description: "List invoice packets that have not been reviewed yet.",
    inputSchema: z.object({}),
    callback: () =>
      store.list("pending").map((packet) => ({
        packetId: packet.id,
        supplier: packet.invoice.supplier,
        invoiceNumber: packet.invoice.number,
      })),
  });

  const inspectInvoicePacket = tool({
    name: "inspect_invoice_packet",
    description:
      "Run deterministic three-way matching on a packet and return exact source evidence and dollar impact.",
    inputSchema: z.object({ packetId: z.string() }),
    callback: ({ packetId }) => inspectPacket(store.get(packetId)),
  });

  const clearCleanPacket = tool({
    name: "clear_clean_packet",
    description:
      "Mark a packet as cleared only after deterministic inspection reports no exceptions.",
    inputSchema: z.object({ packetId: z.string() }),
    callback: ({ packetId }) => {
      const inspection = inspectPacket(store.get(packetId));
      if (!inspection.clean) {
        throw new Error("Packet has an exception and cannot be auto-cleared.");
      }
      const packet = store.clear(packetId);
      return { packetId, status: packet.status };
    },
  });

  const queueHumanReview = tool({
    name: "queue_human_review",
    description:
      "Create one concrete approval question for a packet with a verified exception. This tool never approves payment itself.",
    inputSchema: z.object({ packetId: z.string() }),
    callback: ({ packetId }) => {
      const inspection = inspectPacket(store.get(packetId));
      if (inspection.clean) {
        throw new Error("Clean packets do not need human review.");
      }
      return store.queueReview(packetId, inspection);
    },
  });

  const researchSupplierRisk = tool({
    name: "research_supplier_risk",
    description:
      "Use live SerpApi search data to verify the supplier identity and return current adverse-news evidence. This tool reports sources and never labels a supplier as fraudulent.",
    inputSchema: z.object({ packetId: z.string() }),
    callback: async ({ packetId }) => {
      const supplier = store.get(packetId).invoice.supplier;
      return researchVendor(supplier);
    },
  });

  if (process.env.SERPAPI_API_KEY) {
    return [
      listPendingPackets,
      inspectInvoicePacket,
      clearCleanPacket,
      researchSupplierRisk,
      queueHumanReview,
    ];
  }
  return [listPendingPackets, inspectInvoicePacket, clearCleanPacket, queueHumanReview];
}
