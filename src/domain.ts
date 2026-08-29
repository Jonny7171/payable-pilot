export type PacketStatus =
  | "pending"
  | "cleared"
  | "waiting_for_human"
  | "resolved";

export interface LineItem {
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  number: string;
  supplier: string;
  items: LineItem[];
}

export interface Invoice {
  number: string;
  poNumber: string;
  supplier: string;
  items: LineItem[];
}

export interface GoodsReceipt {
  number: string;
  poNumber: string;
  supplier: string;
  items: LineItem[];
}

export interface Packet {
  id: string;
  status: PacketStatus;
  purchaseOrder: PurchaseOrder;
  invoice: Invoice;
  receipt: GoodsReceipt;
}

export interface Evidence {
  ordered: number;
  invoiced: number;
  received: number;
  orderedUnitPrice: number;
  invoiceUnitPrice: number;
}

export interface Exception {
  code:
    | "SUPPLIER_MISMATCH"
    | "PO_REFERENCE_MISMATCH"
    | "QUANTITY_VARIANCE"
    | "UNIT_PRICE_VARIANCE";
  sku?: string;
  summary: string;
  impact: number;
  evidence?: Evidence;
}

export interface Inspection {
  packetId: string;
  clean: boolean;
  exceptions: Exception[];
  recommendedAction: "CLEAR_FOR_PAYMENT" | "HOLD_AND_REQUEST_CREDIT";
  totalImpact: number;
}

const money = (value: number) => Math.round(value * 100) / 100;

export function inspectPacket(packet: Packet): Inspection {
  const exceptions: Exception[] = [];
  const suppliers = [
    packet.purchaseOrder.supplier,
    packet.invoice.supplier,
    packet.receipt.supplier,
  ];

  if (new Set(suppliers.map((value) => value.trim().toLowerCase())).size !== 1) {
    exceptions.push({
      code: "SUPPLIER_MISMATCH",
      summary: "Supplier names do not agree across the packet.",
      impact: 0,
    });
  }

  if (
    packet.invoice.poNumber !== packet.purchaseOrder.number ||
    packet.receipt.poNumber !== packet.purchaseOrder.number
  ) {
    exceptions.push({
      code: "PO_REFERENCE_MISMATCH",
      summary: "The invoice or receipt points to a different purchase order.",
      impact: 0,
    });
  }

  const poItems = new Map(packet.purchaseOrder.items.map((item) => [item.sku, item]));
  const receiptItems = new Map(packet.receipt.items.map((item) => [item.sku, item]));

  for (const invoiced of packet.invoice.items) {
    const ordered = poItems.get(invoiced.sku);
    const received = receiptItems.get(invoiced.sku);
    const orderedQuantity = ordered?.quantity ?? 0;
    const receivedQuantity = received?.quantity ?? 0;
    const payableQuantity = Math.min(orderedQuantity, receivedQuantity);

    if (invoiced.quantity > payableQuantity) {
      const impact = money((invoiced.quantity - payableQuantity) * invoiced.unitPrice);
      exceptions.push({
        code: "QUANTITY_VARIANCE",
        sku: invoiced.sku,
        summary: `${invoiced.description}: invoiced ${invoiced.quantity}, ordered ${orderedQuantity}, received ${receivedQuantity}.`,
        impact,
        evidence: {
          ordered: orderedQuantity,
          invoiced: invoiced.quantity,
          received: receivedQuantity,
          orderedUnitPrice: ordered?.unitPrice ?? 0,
          invoiceUnitPrice: invoiced.unitPrice,
        },
      });
    }

    if (ordered && invoiced.unitPrice > ordered.unitPrice && payableQuantity > 0) {
      const impact = money((invoiced.unitPrice - ordered.unitPrice) * payableQuantity);
      exceptions.push({
        code: "UNIT_PRICE_VARIANCE",
        sku: invoiced.sku,
        summary: `${invoiced.description}: invoice rate $${invoiced.unitPrice.toFixed(2)}, PO rate $${ordered.unitPrice.toFixed(2)}.`,
        impact,
        evidence: {
          ordered: orderedQuantity,
          invoiced: invoiced.quantity,
          received: receivedQuantity,
          orderedUnitPrice: ordered.unitPrice,
          invoiceUnitPrice: invoiced.unitPrice,
        },
      });
    }
  }

  const totalImpact = money(exceptions.reduce((sum, item) => sum + item.impact, 0));
  return {
    packetId: packet.id,
    clean: exceptions.length === 0,
    exceptions,
    recommendedAction:
      exceptions.length === 0 ? "CLEAR_FOR_PAYMENT" : "HOLD_AND_REQUEST_CREDIT",
    totalImpact,
  };
}
