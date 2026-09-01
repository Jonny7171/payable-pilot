# PayablePilot for The WebMCP Challenge

## One-line description

PayablePilot lets a browser agent inspect an accounts-payable exception and
stage a resolution while keeping the final payment decision with a person.

## Tagline

A browser agent prepares the invoice review. A person makes the payment decision.

## Inspiration

PayablePilot already had a clear safety boundary: the agent could finish routine
work, but a person had to decide what happened to an invoice exception. WebMCP
made it possible to carry that same boundary into the browser. The agent no
longer needs to infer state from a dense dashboard or click the same buttons as
the reviewer.

## What it does

The page exposes two WebMCP tools. `review_payables_queue` returns the current
run, source document IDs, exact price variance, allowed actions, and decision
status. `stage_invoice_resolution` puts one permitted choice into a visible
Agent Draft. It cannot confirm the draft, release a payment, or contact the
supplier.

The included run has two fictional invoice packets. One clears. PP-2086 stops
because eight units were invoiced at $119 instead of the $94 purchase-order
rate. The deterministic difference is $200. An agent can read that evidence and
stage the credit-and-hold option. A person still checks the evidence and either
confirms or dismisses the draft.

## How I built it

The live page is a React and TypeScript app. It registers two tools with
`document.modelContext.registerTool()`, uses strict JSON Schema inputs, and
returns concise JSON. The review tool carries the read-only annotation. The
staging tool updates visible page state but has no code path to record a final
decision. An `AbortController` unregisters both tools with the component
lifecycle.

The queue facts live in one typed module shared by the tools and tests. The test
suite independently checks the $200 calculation, the pending human-confirmation
status, and rejection of actions outside the two visible choices.

## Challenges

The hard part was making the browser tool useful without quietly widening the
agent's authority. A tool that clicked the final button would have been easy to
demo and wrong for the product. I split the flow at the decision boundary: the
agent can prepare the review, while the final click stays with the person who is
accountable for the payment.

I also had to treat the existing project honestly. PayablePilot predates this
challenge, so the repository documents exactly what was added after August 25
and the dated commits isolate the WebMCP work.

## Accomplishments

- Both tools are detected and callable on the public page in ChatGPT's in-app browser.
- The live staging call produces the same visible Agent Draft shown in the demo.
- No agent tool can approve an exception or send anything to a supplier.
- All 17 tests pass, including three focused WebMCP boundary tests.

## What I learned

The most useful browser tools are often smaller than the interface around them.
Two narrow tools were enough here. One reports exact state. One prepares a
reversible draft. Keeping those jobs separate made the agent easier to guide and
the safety boundary easier to verify.

## What's next

The next step is connecting the same tools to a real authenticated review queue.
The browser contract would stay narrow, while the server would add organization
policies, duplicate-invoice checks, reviewer identity, and a durable audit log.

## Why WebMCP fits

Invoice review is a poor place for an agent to guess from button text. The page
contains a purchase order, invoice, receipt, arithmetic, and a hard approval
boundary. WebMCP gives the agent a small, typed contract for reading that state
and putting one allowed choice in front of the reviewer.

The agent does not scrape the page, calculate the difference, invent an action,
or click through a payment decision. PayablePilot returns the exact $200.00
variance from deterministic application data. The write-capable tool can only
stage one of the two choices already present in the interface. It cannot confirm
either choice.

## What people and agents do together

1. The agent calls `review_payables_queue` to read the current run, evidence,
   and allowed actions.
2. The agent explains why PP-2086 was held and can call
   `stage_invoice_resolution` with one permitted action.
3. The page scrolls to a clearly labelled draft showing exactly what the agent
   staged.
4. A person checks the source evidence and confirms or dismisses the draft.

Before WebMCP, an agent had to infer this state from a dense dashboard and use
the same buttons as a person. The extension replaces that brittle actuation
with two explicit tools while preserving the human checkpoint.

## Implementation

The client registers two tools with `document.modelContext.registerTool()`.
Both use strict JSON Schema inputs and concise JSON outputs. The queue tool is
marked read-only. The staging tool updates visible React state but cannot record
a decision. An `AbortController` unregisters both tools with the component
lifecycle.

The tool results share the same typed queue facts used by the page. Tests verify
the $200.00 arithmetic, the human-confirmation status, and rejection of actions
outside the two visible choices.

## Work added during the challenge

PayablePilot existed before The WebMCP Challenge. The WebMCP implementation,
visible agent draft, safety boundary, tests, and this documentation were added
after the submission period began on August 25, 2026. Git history provides the
dated record required for a pre-existing project.

## Judge path

1. Open the live URL in ChatGPT's in-app browser or Chrome with WebMCP enabled.
2. Ask: "Review the payables queue and tell me what needs a decision."
3. Ask: "Stage the credit-and-hold option for me."
4. Confirm that the page shows an uncommitted agent draft and still requires a
   human click.
