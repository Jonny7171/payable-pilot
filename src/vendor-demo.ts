import { createStore } from "./workflow.js";
import { researchVendor } from "./vendor-intel.js";

const packet = createStore().get(process.argv[2] ?? "PP-1042");
const result = await researchVendor(packet.invoice.supplier);
console.log(JSON.stringify(result, null, 2));
