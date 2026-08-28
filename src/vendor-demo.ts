import { createStore } from "./workflow.js";
import { researchVendor } from "./vendor-intel.js";

const args = process.argv.slice(2).filter((argument) => argument !== "--");
const packetFlag = args.indexOf("--packet");
const packetId = packetFlag >= 0 ? args[packetFlag + 1] : "PP-1042";
if (!packetId) throw new Error("A packet ID is required after --packet");
const packet = createStore().get(packetId);
const supplierFlag = args.indexOf("--supplier");
const supplier = supplierFlag >= 0 ? args[supplierFlag + 1] : packet.invoice.supplier;
if (!supplier) throw new Error("A supplier name is required after --supplier");
const result = await researchVendor(supplier);
console.log(JSON.stringify(result, null, 2));
