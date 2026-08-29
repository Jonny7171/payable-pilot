# Kong Build Sprint route

PayablePilot exposes its verified invoice decision as a customer-facing API.
Kong Konnect sits on the critical commercial path: it identifies each customer,
rejects unknown callers, limits traffic, meters every accepted decision, and
turns that usage into a billable product plan.

## Why Kong matters

The upstream service only returns a deterministic decision. It does not know
who bought access, how much they used, or which plan they are on. Removing Kong
removes customer identity, access control, usage records, and billing.

## Local upstream

```bash
pnpm agentcore:build
pnpm agentcore:start
```

The metered endpoint is `POST /v1/decisions`:

```json
{
  "packetId": "PP-2086"
}
```

The response includes the exact document evidence, the independently computed
dollar impact, and whether a person must decide what happens next.

## Konnect configuration

1. Start a Konnect data plane with Kong's official quickstart.
2. Create a Metering system-account token with the Ingest role and export it as
   `DECK_AUTH_TOKEN`.
3. Apply the checked-in configuration:

```bash
deck gateway apply kong/kong.yml
```

4. In Metering & Billing, create an API-request meter, a feature filtered to
   `payable-pilot-decision-api`, a usage-priced plan, and a customer mapped to
   the `payable-pilot-demo` Consumer.
5. Send a request through the Konnect proxy and verify that the request appears
   in the customer's usage and invoice preview.

The checked-in credential is for the local contest demo only. Production
customers receive generated credentials through Kong.

## Demo proof

The final recording should show four facts in one pass:

1. A request without a key receives `401`.
2. The demo Consumer receives the verified `$200.00` review decision.
3. Kong attributes the request to that Consumer.
4. Konnect Metering & Billing adds the request to the customer's usage.
