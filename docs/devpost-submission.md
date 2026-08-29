# PayablePilot Devpost submission

## Tagline

A Strands agent clears matched invoices and stops price exceptions for a person.

## Inspiration

Most invoice packets are routine, but someone still has to open them. I wanted to see if a Strands agent could finish the clean packet and stop on the one thing it should not decide by itself: a price exception.

## What it does

The included run has two fictional packets. PP-2087 clears because the purchase order, invoice, and receipt agree. PP-2086 stops because Everett Workplace Systems invoiced eight monitor arms at $119 each while the purchase order lists $94. The difference is $25 per unit and $200 in total.

The agent calls four explicit tools to list the queue, inspect a packet, clear a match, or send an exception to review. The reviewer can request a credit and hold the invoice or choose to pay it anyway. The agent cannot make that choice.

## How I built it

I used the Strands Agents SDK for the agent loop and tool selection. A separate TypeScript domain layer reads the packet fixture, checks the three documents, and calculates the price difference. That separation matters: the agent controls the sequence, but code owns quantities, prices, and the final dollar amount.

The repository also includes an AgentCore-compatible HTTP runtime, a deterministic offline model that exercises the real Strands loop without cloud credentials, and tests for the agent, financial checks, supplier evidence, and API response.

The public page replays the included fixture so judges can inspect both agent states without AWS credentials. It is not presented as a live accounting connection. The executable Strands loop and four tools are in the repository.

## Challenges

The difficult part was deciding where the agent had to stop. Letting the model calculate the amount would have made the demo shorter, but it would also make the result harder to audit. I kept all money math in the domain layer and limited the agent to choosing tools.

I also separated this example from my document-verification project. PayablePilot now has its own supplier, packet IDs, price-variance case, interface, tests, and architecture.

## What is working

- PP-2087 clears only after the three documents agree.
- PP-2086 is held on a verified $200 unit-price difference.
- Four explicit tool calls are visible in the run log.
- A person must make the exception decision.
- Ten tests cover the agent loop, matching rules, server, and supplier-evidence guardrails.

## What I learned

The useful part of the agent is not financial improvisation. It is choosing the next bounded action while ordinary code keeps the facts and arithmetic stable.

## What is next

- Connect the runtime to a real invoice queue
- Persist tool calls and review decisions
- Extract purchase orders and invoices instead of using fixtures
- Add customer-specific approval policies

## Submission fields

- Public demo: https://jonny7171.github.io/payable-pilot/
- Source: https://github.com/Jonny7171/payable-pilot
- Screenshot: `docs/live-before.jpg`
- Resolved state: `docs/live-after.jpg`
- Architecture: `docs/architecture.png`
- Demo video: replace after uploading `output/devpost/payable-pilot-demo.mp4`
