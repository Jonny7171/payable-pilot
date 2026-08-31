PayablePilot runs two fictional invoice packets through a Strands agent. This 90-second walkthrough shows PP-2087 clearing, PP-2086 stopping on a verified $200 unit-price difference, and a person recording the credit request and hold.

August 30 update: I added a live supplier check through SerpApi. It matched CDW Canada across three identity sources and found no adverse news tied to the company. The invoice and purchase order are fictional demo records. The public evidence file records the six-tool Strands run, both SerpApi search IDs, the $200 calculation, and the human review state.

Live supplier view:
https://jonny7171.github.io/payable-pilot/?engine=serpapi

Run evidence:
https://jonny7171.github.io/payable-pilot/proof/strands-serpapi-run.json

AgentCore-compatible HTTP contract proof:
https://jonny7171.github.io/payable-pilot/proof/agentcore-contract-run.json

Source:
https://github.com/Jonny7171/payable-pilot

The public dashboard is a replay of the included fixture. The August 30 evidence proves a real Strands tool loop with live SerpApi calls and a deterministic test model. It is not presented as a Bedrock, AgentCore, or live-LLM run.
