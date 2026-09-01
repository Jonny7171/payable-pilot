# PayablePilot for The WebMCP Challenge

## One-line description

PayablePilot lets a browser agent inspect an accounts-payable exception and
stage a resolution while keeping the final payment decision with a person.

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

