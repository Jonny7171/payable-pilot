# Architecture

```mermaid
flowchart LR
  A[New invoice packets] --> B[Strands agent]
  B --> C[List pending packets]
  B --> D[Deterministic three-way match]
  D -->|Clean| E[Clear for payment]
  D -->|Exception| S[SerpApi supplier evidence]
  S --> F[Queue one decision]
  F --> G[Human approval]
  G --> H[Vendor action and audit record]
```

The model chooses which workflow tool to call next. The matching code owns every
fact, verdict, and dollar amount. The agent cannot approve payments, manufacture
evidence, or bypass the human checkpoint.
