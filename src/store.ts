import type { Inspection, Packet, PacketStatus } from "./domain.js";

export interface ReviewCase {
  packetId: string;
  inspection: Inspection;
  question: string;
  proposedAction: "REQUEST_CREDIT";
}

export class PacketStore {
  private readonly packets = new Map<string, Packet>();
  private readonly reviewCases = new Map<string, ReviewCase>();

  constructor(seed: Packet[]) {
    for (const packet of seed) {
      this.packets.set(packet.id, structuredClone(packet));
    }
  }

  list(status: PacketStatus = "pending"): Packet[] {
    return [...this.packets.values()].filter((packet) => packet.status === status);
  }

  get(packetId: string): Packet {
    const packet = this.packets.get(packetId);
    if (!packet) throw new Error(`Unknown packet: ${packetId}`);
    return packet;
  }

  clear(packetId: string): Packet {
    const packet = this.get(packetId);
    packet.status = "cleared";
    return packet;
  }

  queueReview(packetId: string, inspection: Inspection): ReviewCase {
    const packet = this.get(packetId);
    packet.status = "waiting_for_human";
    const reviewCase: ReviewCase = {
      packetId,
      inspection,
      proposedAction: "REQUEST_CREDIT",
      question: `Hold ${packet.invoice.number} and request a $${inspection.totalImpact.toFixed(2)} credit?`,
    };
    this.reviewCases.set(packetId, reviewCase);
    return reviewCase;
  }

  pendingReviews(): ReviewCase[] {
    return [...this.reviewCases.values()];
  }
}
