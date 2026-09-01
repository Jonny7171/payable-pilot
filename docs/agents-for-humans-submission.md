# Agents for Humans submission

## Entry choice

- Track: Professional Agents
- Entrant: Individual
- Project: PayablePilot
- Tagline: A Strands agent clears routine invoice packets and sends only real payment exceptions to a person.

PayablePilot was created on August 27, 2026, inside the August 10 to September
14 submission period. The repository history records the build from the first
working commit.

## About the project

### Why I built it

Accounts payable teams spend too much time checking routine invoices and still
need to stop when one number is wrong. I built PayablePilot to separate those
two jobs. Clean packets should finish quietly. Anything that could change a
payment should reach a person with the math already checked.

### What it does

PayablePilot gives a Strands agent a small invoice queue and five tools. The
agent lists the pending packets, inspects each purchase order, invoice, and
receipt, and then chooses the next tool.

The demo has two fictional packets. One is a clean three-way match, so the agent
clears it. The other contains eight monitor arms ordered at $94 CAD and invoiced
at $119 CAD. Regular TypeScript calculates the $200 difference. The agent can
research the supplier and queue one review question, but it cannot approve the
exception or change the amount.

### Who it is for

The first user is a small finance team that handles enough invoices to lose time
on routine checks, but not enough to justify a large procurement system. The
same pattern also fits bookkeepers and operations teams that need automation
without giving a model control over money.

### Why an agent helps

The work is not one fixed function call. The next step depends on what each
packet contains. Strands chooses among the workflow tools, clears the clean
case, gathers more evidence for the exception, and stops at the human decision.
The document comparison and dollar calculation stay deterministic.

### How I built it

The agent uses the Strands Agents SDK with custom tools for listing packets,
inspecting the three-way match, clearing a clean packet, researching supplier
evidence, and queuing human review. A deterministic model drives the public
proof run so anyone can reproduce the same tool order without AWS credentials.
The repository also supports a Bedrock-backed model when credentials are
available.

The interface is a public replay of the included fixture. It shows the queue,
the exact source values, the $200 calculation, the supplier evidence, and the
reviewer's final choice. An AgentCore-compatible HTTP runtime is included with
`/ping` and `/invocations` endpoints. It is verified locally and is not
presented as a cloud deployment.

### Safety boundary

The agent may clear a packet only after the deterministic comparison reports no
exception. It may queue an exception for review, but it cannot approve payment,
contact a supplier, or manufacture evidence. Search results are treated as
sources, not as a fraud score.

### What is working

- A real Strands tool loop processes both packets end to end.
- Clean packet PP-2087 clears without asking for approval.
- Exception packet PP-2086 stays on hold with a verified $200 impact.
- The public demo exposes the source values and the human decision.
- Fourteen tests cover the agent loop, arithmetic, search guardrails, HTTP
  runtime, and review boundary.
- The public repository includes an MIT license, setup instructions, the
  architecture diagram, fixtures, and sanitized run evidence.

### What I learned

The useful boundary is simple. Let the agent decide which work step comes next,
let ordinary code own the facts and money, and make the person responsible for
the exception. That makes the automation useful without hiding the decision.

### What is next

The next step would connect PayablePilot to an accounting inbox and deploy the
runtime on Amazon Bedrock AgentCore. I would also add duplicate-invoice checks
and configurable tolerance rules before connecting it to a real payment system.

## Built with

Strands Agents SDK, TypeScript, Node.js, React, Next.js, Amazon Bedrock-ready
model adapter, AgentCore-compatible HTTP runtime, SerpApi, Zod

## Links

- Live demo: https://jonny7171.github.io/payable-pilot/
- Source: https://github.com/Jonny7171/payable-pilot
- Architecture: https://github.com/Jonny7171/payable-pilot/blob/main/docs/architecture.svg
- Public run evidence: https://jonny7171.github.io/payable-pilot/proof/strands-serpapi-run.json
- Demo video: upload `output/agents-for-humans/payable-pilot-agents-for-humans.mp4`

## Additional information checklist

- [ ] Join the Agents for Humans Hackathon.
- [ ] Enter AWS Builder ID.
- [ ] Select Professional Agents.
- [ ] Confirm the YouTube video is Public, not Unlisted.
- [ ] Paste the public repository and live demo URLs.
- [ ] Upload `docs/architecture.png` to the image gallery.
- [ ] Paste the project story above.
- [ ] Read and personally accept the official rules.
- [ ] Submit before September 14, 2026 at 5:00 PM PDT.

## Judge verification

```bash
pnpm install
pnpm test
pnpm agent:offline
pnpm agentcore:build
pnpm agentcore:offline
```

The public demo uses fictional invoice data. The SerpApi evidence file records a
live supplier-information lookup, while the agent proof model is deliberately
deterministic and labelled as such. No production accounting data is included.
