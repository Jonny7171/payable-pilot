# Nebius x NVIDIA submission notes

## Track

Best Apps and Agents

## One-line pitch

PayablePilot is a guarded accounts-payable agent that uses NVIDIA Nemotron on
Nebius Token Factory to work an invoice queue, clears only packets supported by
matching source records, and stops before a person must authorize money.

## Required technology

- Runtime model: `nvidia/nemotron-3-super-120b-a12b`
- Inference: Nebius Token Factory OpenAI-compatible chat API
- Orchestration: Strands Agents SDK
- Money and evidence checks: deterministic TypeScript tools
- Human boundary: exceptions can be queued, but never approved by the model

## Submission evidence to capture

1. Token Factory model page with Nemotron 3 Super selected.
2. Terminal run showing `Model provider: nebius` and the four guarded tools.
3. Public demo in `?engine=nebius` mode.
4. Human decision flow changing the open review count from one to zero.
5. Repository setup instructions and MIT license.

## Before submitting

- Run one end-to-end call with a real Token Factory API key.
- Record a public YouTube demo no longer than three minutes with audio.
- Explain that the Nebius integration and Nemotron mode were added during the
  submission period.
- Include direct product feedback on Token Factory.
- Never place a Nebius API key in the browser bundle or repository.
