"use client";

import { useEffect, useRef, useState } from "react";

import {
  decisionDraftResult,
  queueReviewResult,
  type WebMcpDecisionAction,
} from "../src/webmcp";

type Decision = "credit" | "override" | null;

const supplierSources = [
  {
    source: "OECM",
    link: "https://oecm.ca/supplier-partners/cdw-canada/",
  },
  {
    source: "Business Wire",
    date: "6 days ago",
    link: "https://www.businesswire.com/news/home/20260825764919/en/CDW-Canada-Opens-New-Calgary-Hub-Deepening-Its-Investment-in-Western-Canada",
  },
];

export default function Home() {
  const [decision, setDecision] = useState<Decision>(null);
  const [stagedDecision, setStagedDecision] = useState<Exclude<Decision, null> | null>(null);
  const [webMcpReady, setWebMcpReady] = useState(false);
  const [nebiusMode, setNebiusMode] = useState(false);
  const [serpApiMode, setSerpApiMode] = useState(false);
  const decisionRef = useRef<Decision>(null);
  const requestedCredit = decision === "credit";

  function recordDecision(nextDecision: Exclude<Decision, null>) {
    decisionRef.current = nextDecision;
    setDecision(nextDecision);
    setStagedDecision(null);
  }

  useEffect(() => {
    const engine = new URLSearchParams(window.location.search).get("engine");
    setNebiusMode(engine === "nebius");
    setSerpApiMode(engine === "serpapi");
  }, []);

  useEffect(() => {
    if (!document.modelContext) return;

    const controller = new AbortController();
    let mounted = true;

    const registrations = [
      document.modelContext.registerTool(
        {
          name: "review_payables_queue",
          description:
            "Read the current accounts-payable queue, the held invoice, its source evidence, and the allowed human decisions.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          execute: async () => JSON.stringify(queueReviewResult(decisionRef.current)),
          annotations: {
            readOnlyHint: true,
            untrustedContentHint: false,
          },
        },
        { signal: controller.signal },
      ),
      document.modelContext.registerTool(
        {
          name: "stage_invoice_resolution",
          description:
            "Stage one permitted resolution for invoice INV-25791 in the visible review panel. A person must still confirm or dismiss it.",
          inputSchema: {
            type: "object",
            properties: {
              action: {
                type: "string",
                enum: [
                  "request_credit_and_hold",
                  "approve_payment_override",
                ],
                description: "The resolution to place in front of the reviewer.",
              },
            },
            required: ["action"],
            additionalProperties: false,
          },
          execute: async ({ action }) => {
            if (decisionRef.current) {
              return JSON.stringify({
                status: "already_resolved",
                recordedDecision: decisionRef.current,
                control: "The human decision is already recorded. Reload the demo to start a fresh review.",
              });
            }

            const draft = decisionDraftResult(action);
            setStagedDecision(
              (action as WebMcpDecisionAction) === "request_credit_and_hold"
                ? "credit"
                : "override",
            );
            document.getElementById("review")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            return JSON.stringify(draft);
          },
          annotations: {
            readOnlyHint: false,
            untrustedContentHint: false,
          },
        },
        { signal: controller.signal },
      ),
    ];

    Promise.all(registrations).then(() => {
      if (mounted) setWebMcpReady(true);
    }).catch(() => {
      if (mounted) setWebMcpReady(false);
    });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="PayablePilot home">
          <span className="brand-mark">PP</span>
          <span>PayablePilot</span>
        </a>
        <nav className="product-nav" aria-label="Product sections">
          <a href="#queue">Queue</a>
          <a href="#review">Review log</a>
          <a href="#agent">Agent settings</a>
        </nav>
        <div className="topbar-right">
          <span className="last-run">Last run 09:41:06</span>
          <span className="live-dot"><i /> {nebiusMode ? "Nemotron on Nebius" : serpApiMode ? "SerpApi connected" : "Strands online"}</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">AP queue / August 29, 2026</p>
            <h1>Two packets processed. One needs review.</h1>
            <p className="lede">
              The agent cleared one matched invoice and held INV-25791 after the
              billed unit price did not match PO-8412.
            </p>
          </div>
          <div className="protected-card">
            <span>Held from payment</span>
            <strong>$200.00</strong>
            <small>8 units billed $25.00 above the PO rate</small>
          </div>
        </section>

        <section className="stats" id="queue" aria-label="Run summary">
          <article><span>Packets found</span><strong>2</strong></article>
          <article><span>Cleared quietly</span><strong>1</strong></article>
          <article><span>Needs a decision</span><strong className="warn">{decision ? 0 : 1}</strong></article>
          <article>
            <span>{nebiusMode ? "Reasoning model" : serpApiMode ? "Live data" : "Agent runtime"}</span>
            <strong className="runtime">{nebiusMode ? "Nemotron 3 Super" : serpApiMode ? "SerpApi" : "Strands"}</strong>
          </article>
        </section>

        <section className="workspace" id="review">
          <article className="panel activity-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">Live run</p><h2>What the agent did</h2></div>
              <span className="run-id">RUN 08-29-01</span>
            </div>

            <ol className="timeline">
              <li className="done">
                <span className="timeline-icon">1</span>
                <div><strong>Found 2 new packets</strong><p>{nebiusMode ? "Nemotron on Nebius read the queue through a guarded tool." : "Read the pending invoice queue."}</p><code>list_pending_packets</code></div>
                <time>09:41:02</time>
              </li>
              <li className="done">
                <span className="timeline-icon">2</span>
                <div><strong>Cleared PP-2087</strong><p>PO-8413, INV-61308, and GR-9135 agree.</p><code>clear_clean_packet</code></div>
                <time>09:41:04</time>
              </li>
              <li className="alert">
                <span className="timeline-icon">3</span>
                <div><strong>Stopped PP-2086</strong><p>{serpApiMode ? "The price variance triggered a live supplier research check." : "Invoice rate is $25.00 above the purchase order rate."}</p><code>{serpApiMode ? "research_supplier_risk" : "inspect_invoice_packet"}</code></div>
                <time>09:41:06</time>
              </li>
              <li className={decision ? "done" : "waiting"}>
                <span className="timeline-icon">4</span>
                <div>
                  <strong>{decision ? (requestedCredit ? "Credit request approved" : "Payment override approved") : "Waiting for your decision"}</strong>
                  <p>{decision ? (requestedCredit ? "INV-25791 is on hold until the $200.00 credit is received." : "INV-25791 was released with the variance attached.") : "No payment or supplier action was taken."}</p>
                  <code>{decision ? "record_human_decision" : "queue_human_review"}</code>
                </div>
                <time>{decision ? "just now" : "now"}</time>
              </li>
            </ol>

            <div className="guardrail" id="agent">
              <span>Control</span>
              <p>The agent may clear a matched packet. A person must approve any exception.</p>
            </div>

            <div className={`webmcp-status${webMcpReady ? " ready" : ""}`}>
              <span>{webMcpReady ? "WebMCP live" : "WebMCP ready"}</span>
              <p>An agent can read this queue and stage a resolution. It cannot confirm the decision.</p>
            </div>
          </article>

          <aside className={`panel decision-panel${decision ? " resolved" : ""}`}>
            <div className="decision-topline">
              <span className="exception-badge">{decision ? "Decision recorded" : "Decision required"}</span>
              <span className="packet-id">PP-2086</span>
            </div>
            <h2>{decision ? (requestedCredit ? "Invoice held. Credit request queued." : "Override recorded. Invoice released.") : "Hold INV-25791 and request a $200.00 credit?"}</h2>
            <p className="supplier">CDW Canada Corp. · PO-8412 · demo packet</p>

            {serpApiMode && (
              <div className="supplier-check">
                <span>Live supplier intelligence</span>
                <strong>Identity matched across 3 sources</strong>
                <p>No adverse news matched. The invoice and purchase order are fictional demo records.</p>
                <div className="supplier-sources">
                  {supplierSources.map((source) => (
                    <a key={source.link} href={source.link} target="_blank" rel="noreferrer">
                      {source.source}
                      {source.date ? ` · ${source.date}` : ""}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="evidence-grid">
              <div><span>PO rate</span><strong>$94</strong></div>
              <div className="bad"><span>Invoice rate</span><strong>$119</strong></div>
              <div><span>Quantity</span><strong>8</strong></div>
              <div><span>Difference</span><strong>$25</strong></div>
            </div>

            <div className="math-row"><span>8 units × $25.00 rate difference</span><strong>$200.00</strong></div>

            <div className="source-list">
              <div><i className="source-ok">✓</i><span>Purchase order</span><code>PO-8412</code></div>
              <div><i className="source-bad">!</i><span>Supplier invoice</span><code>INV-25791</code></div>
              <div><i className="source-ok">✓</i><span>Goods receipt</span><code>GR-9134</code></div>
            </div>

            {stagedDecision && !decision ? (
              <div className="agent-draft">
                <span>Agent draft</span>
                <strong>
                  {stagedDecision === "credit"
                    ? "Request a $200.00 credit and hold the invoice"
                    : "Approve payment despite the $200.00 variance"}
                </strong>
                <p>Nothing has been approved or sent. Check the evidence, then confirm or dismiss this draft.</p>
                <div className="actions">
                  <button className="primary" onClick={() => recordDecision(stagedDecision)}>Confirm decision</button>
                  <button className="secondary" onClick={() => setStagedDecision(null)}>Dismiss draft</button>
                </div>
              </div>
            ) : (
              <div className="actions">
                <button className="primary" onClick={() => recordDecision("credit")}>Request credit and hold</button>
                <button className="secondary" onClick={() => recordDecision("override")}>Pay anyway</button>
              </div>
            )}
            <p className="decision-note">
              {decision ? "The review record now includes this decision." : "No action is taken until a reviewer chooses."}
            </p>
          </aside>
        </section>

        <footer>
          <div><span className="footer-mark">P</span> PayablePilot</div>
          <p>
            {nebiusMode ? "Strands with Nemotron on Nebius" : serpApiMode ? "Strands with live SerpApi supplier research" : "Strands agent run with four explicit tools"}
            {serpApiMode && (
              <>
                {" · "}
                <a
                  className="proof-link"
                  href="https://jonny7171.github.io/payable-pilot/proof/strands-serpapi-run.json"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open run evidence
                </a>
              </>
            )}
          </p>
        </footer>
      </main>
    </div>
  );
}
