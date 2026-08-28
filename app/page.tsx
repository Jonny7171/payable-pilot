"use client";

import { useEffect, useState } from "react";

type Decision = "credit" | "override" | null;

export default function Home() {
  const [decision, setDecision] = useState<Decision>(null);
  const [nebiusMode, setNebiusMode] = useState(false);
  const requestedCredit = decision === "credit";

  useEffect(() => {
    const engine = new URLSearchParams(window.location.search).get("engine");
    setNebiusMode(engine === "nebius");
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="PayablePilot home">
          <span className="brand-mark">P</span>
          <span>PayablePilot</span>
        </a>
        <div className="topbar-right">
          <span className="live-dot"><i /> {nebiusMode ? "Nemotron on Nebius" : "Agent watching"}</span>
          <span className="avatar" aria-label="Signed in as Jonathan">JG</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">Invoice exception desk</p>
            <h1>Routine packets cleared.<br />One decision needs you.</h1>
            <p className="lede">
              PayablePilot worked through the queue, verified the source records,
              and stopped before an $18.40 overpayment.
            </p>
          </div>
          <div className="protected-card">
            <span>Protected this run</span>
            <strong>$18.40</strong>
            <small>1 verified quantity variance</small>
          </div>
        </section>

        <section className="stats" aria-label="Run summary">
          <article><span>Packets found</span><strong>2</strong></article>
          <article><span>Cleared quietly</span><strong>1</strong></article>
          <article><span>Needs a decision</span><strong className="warn">{decision ? 0 : 1}</strong></article>
          <article>
            <span>{nebiusMode ? "Reasoning model" : "Agent runtime"}</span>
            <strong className="runtime">{nebiusMode ? "Nemotron 3 Super" : "Strands"}</strong>
          </article>
        </section>

        <section className="workspace">
          <article className="panel activity-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">Live run</p><h2>What the agent did</h2></div>
              <span className="run-id">RUN 08-27-01</span>
            </div>

            <ol className="timeline">
              <li className="done">
                <span className="timeline-icon">1</span>
                <div><strong>Found 2 new packets</strong><p>{nebiusMode ? "Nemotron on Nebius read the queue through a guarded tool." : "Read the pending invoice queue."}</p><code>list_pending_packets</code></div>
                <time>09:41:02</time>
              </li>
              <li className="done">
                <span className="timeline-icon">2</span>
                <div><strong>Cleared PP-1043</strong><p>PO-7720, INV-90811, and GR-8822 agree.</p><code>clear_clean_packet</code></div>
                <time>09:41:04</time>
              </li>
              <li className="alert">
                <span className="timeline-icon">3</span>
                <div><strong>Stopped PP-1042</strong><p>Invoice quantity exceeds both ordered and received quantity.</p><code>inspect_invoice_packet</code></div>
                <time>09:41:06</time>
              </li>
              <li className={decision ? "done" : "waiting"}>
                <span className="timeline-icon">4</span>
                <div>
                  <strong>{decision ? (requestedCredit ? "Credit request approved" : "Payment override approved") : "Waiting for your decision"}</strong>
                  <p>{decision ? (requestedCredit ? "INV-44318 is on hold until the $18.40 credit is received." : "INV-44318 was released with the variance attached.") : "No payment or supplier action was taken."}</p>
                  <code>{decision ? "record_human_decision" : "queue_human_review"}</code>
                </div>
                <time>{decision ? "just now" : "now"}</time>
              </li>
            </ol>

            <div className="guardrail">
              <span>Human boundary</span>
              <p>The agent can clear verified packets. It cannot approve an exception.</p>
            </div>
          </article>

          <aside className={`panel decision-panel${decision ? " resolved" : ""}`}>
            <div className="decision-topline">
              <span className="exception-badge">{decision ? "Decision recorded" : "Decision required"}</span>
              <span className="packet-id">PP-1042</span>
            </div>
            <h2>{decision ? (requestedCredit ? "Invoice held. Credit request queued." : "Override recorded. Invoice released.") : "Hold INV-44318 and request an $18.40 credit?"}</h2>
            <p className="supplier">Northstar Safety Supply · PO-7719</p>

            <div className="evidence-grid">
              <div><span>Ordered</span><strong>10</strong></div>
              <div className="bad"><span>Invoiced</span><strong>12</strong></div>
              <div><span>Received</span><strong>10</strong></div>
              <div><span>Unit price</span><strong>$9.20</strong></div>
            </div>

            <div className="math-row"><span>2 extra units × $9.20</span><strong>$18.40</strong></div>

            <div className="source-list">
              <div><i className="source-ok">✓</i><span>Purchase order</span><code>PO-7719</code></div>
              <div><i className="source-bad">!</i><span>Supplier invoice</span><code>INV-44318</code></div>
              <div><i className="source-ok">✓</i><span>Goods receipt</span><code>GR-8821</code></div>
            </div>

            <div className="actions">
              <button className="primary" onClick={() => setDecision("credit")}>Request credit and hold</button>
              <button className="secondary" onClick={() => setDecision("override")}>Pay anyway</button>
            </div>
            <p className="decision-note">
              {decision ? "Audit record updated with Jonathan Gagnon's decision." : "Your choice is written to the audit record."}
            </p>
          </aside>
        </section>

        <footer>
          <div><span className="footer-mark">P</span> PayablePilot</div>
          <p>{nebiusMode ? "Nebius Token Factory. Deterministic money. Human authority." : "Agentic orchestration. Deterministic money. Human authority."}</p>
        </footer>
      </main>
    </div>
  );
}
