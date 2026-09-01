export type WebMcpDecisionAction =
  | "request_credit_and_hold"
  | "approve_payment_override";

export type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<string>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
};

export type WebMcpModelContext = {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ) => Promise<void>;
};

declare global {
  interface Document {
    modelContext?: WebMcpModelContext;
  }
}

export const payablePilotQueue = {
  runId: "RUN 08-29-01",
  packetsFound: 2,
  clearedPacket: "PP-2087",
  reviewPacket: "PP-2086",
  supplier: "CDW Canada Corp.",
  purchaseOrder: "PO-8412",
  invoice: "INV-25791",
  receipt: "GR-9134",
  orderedUnitPrice: 94,
  invoicedUnitPrice: 119,
  quantity: 8,
  differencePerUnit: 25,
  totalDifference: 200,
} as const;

export function queueReviewResult(
  recordedDecision: "credit" | "override" | null,
) {
  return {
    status: recordedDecision ? "resolved" : "human_review_required",
    runId: payablePilotQueue.runId,
    queue: {
      packetsFound: payablePilotQueue.packetsFound,
      cleared: payablePilotQueue.clearedPacket,
      needsReview: payablePilotQueue.reviewPacket,
    },
    exception: {
      packetId: payablePilotQueue.reviewPacket,
      supplier: payablePilotQueue.supplier,
      purchaseOrder: payablePilotQueue.purchaseOrder,
      invoice: payablePilotQueue.invoice,
      receipt: payablePilotQueue.receipt,
      evidence: `${payablePilotQueue.quantity} units were invoiced at $${payablePilotQueue.invoicedUnitPrice} instead of the $${payablePilotQueue.orderedUnitPrice} purchase-order rate.`,
      totalDifference: payablePilotQueue.totalDifference,
      allowedActions: [
        "request_credit_and_hold",
        "approve_payment_override",
      ],
    },
    recordedDecision,
    control: "An agent may inspect the evidence and stage a decision. Only a person can confirm it.",
  };
}

export function decisionDraftResult(action: unknown) {
  if (
    action !== "request_credit_and_hold" &&
    action !== "approve_payment_override"
  ) {
    throw new Error(
      "Choose request_credit_and_hold or approve_payment_override.",
    );
  }

  return {
    status: "awaiting_human_confirmation",
    packetId: payablePilotQueue.reviewPacket,
    action,
    label:
      action === "request_credit_and_hold"
        ? "Request a $200.00 credit and hold the invoice"
        : "Approve payment despite the $200.00 variance",
    control: "Nothing was approved or sent. The draft is visible for a person to confirm or dismiss.",
  };
}

