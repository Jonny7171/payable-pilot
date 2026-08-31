# PayablePilot demo script

Target length: 90 to 120 seconds.

## 0:00 to 0:12

Show the default dashboard.

Say:

"This is PayablePilot. It works an accounts payable queue and only bothers a person when money is actually at risk."

## 0:12 to 0:30

Point to the two packets, the cleared count, and the $200 hold.

Say:

"There are two fictional invoice packets in this run. One matches its purchase order and receipt, so it clears. The other has a price problem, so it stops."

## 0:30 to 0:52

Show the PP-2086 evidence card.

Say:

"The purchase order says $94 per unit. The invoice says $119. Eight units times the $25 difference is $200. That math is regular TypeScript, not a model guess."

## 0:52 to 1:10

Open the SerpApi view and point to the supplier intelligence box.

Say:

"For the exception packet, the Strands agent also ran a live supplier check through SerpApi. It matched CDW Canada across three sources and found no adverse news tied to the company. The invoice itself is a demo record. Search results are evidence here, not a fraud verdict."

## 1:10 to 1:28

Open the public run evidence file.

Say:

"This file is the actual run evidence. It records the Strands runtime, six tool calls, both SerpApi search IDs, the $200 calculation, and the human review state. It also says plainly that this run used a deterministic test model, not Bedrock."

## 1:28 to 1:45

Return to the dashboard and click Request credit and hold.

Say:

"The agent can clear a clean packet, but it cannot approve this exception. A person decides whether to request the credit or pay anyway. I am requesting the credit, so the invoice stays on hold."

## 1:45 to 1:55

Show the resolved state.

Say:

"That is PayablePilot: routine work finishes quietly, financial exceptions stay auditable, and a person keeps the final say."

## Recording notes

- Use your own voice. Do not use synthetic narration.
- Keep the mouse still while speaking.
- Do one clean take. Small pauses sound more natural than reading fast.
- Do not claim a live accounting system, Bedrock run, AgentCore deployment, or live LLM unless that proof exists before recording.
