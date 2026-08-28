const decisionCard = document.querySelector("#decision-card");
const badge = decisionCard.querySelector(".exception-badge");
const heading = decisionCard.querySelector("h2");
const note = decisionCard.querySelector(".decision-note");
const approvalStep = document.querySelector("#approval-step");
const approvalTitle = document.querySelector("#approval-title");
const approvalDetail = document.querySelector("#approval-detail");
const approvalTool = document.querySelector("#approval-tool");
const approvalTime = document.querySelector("#approval-time");
const toast = document.querySelector("#toast");

function finishDecision(kind) {
  const requestedCredit = kind === "credit";
  decisionCard.classList.add("resolved");
  badge.textContent = "Decision recorded";
  heading.textContent = requestedCredit
    ? "Invoice held. Credit request queued."
    : "Override recorded. Invoice released.";
  note.textContent = "Audit record updated with Jonathan Gagnon's decision.";

  approvalStep.classList.remove("waiting");
  approvalStep.classList.add("done");
  approvalTitle.textContent = requestedCredit
    ? "Credit request approved"
    : "Payment override approved";
  approvalDetail.textContent = requestedCredit
    ? "INV-44318 is on hold until the $18.40 credit is received."
    : "INV-44318 was released with the quantity variance attached.";
  approvalTool.textContent = "record_human_decision";
  approvalTime.textContent = "just now";

  toast.textContent = requestedCredit
    ? "Recorded. The agent can now send the verified credit request."
    : "Recorded. The exception remains visible in the audit trail.";
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3600);
}

document
  .querySelector("#approve-action")
  .addEventListener("click", () => finishDecision("credit"));
document
  .querySelector("#override-action")
  .addEventListener("click", () => finishDecision("override"));
