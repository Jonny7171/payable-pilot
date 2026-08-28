# SerpApi challenge submission notes

## One-line pitch

PayablePilot is an invoice exception agent that combines deterministic
three-way matching with live SerpApi supplier intelligence before a person
authorizes money.

## Where SerpApi does the work

The `research_supplier_risk` tool runs only for exception packets. It uses the
Google Search API for supplier identity evidence and the Google News search
type for current adverse-news sources. Structured results and SerpApi search
IDs are kept with the review record.

## Safety boundary

- Search results are evidence, not a verdict.
- The tool never labels a supplier as fraudulent.
- An absent identity match is reported only as unverified.
- No invoice is paid and no supplier is contacted without a person.
- Clean packets do not spend search credits.

## Submission checklist

- Activate the existing free SerpApi account.
- Run one real end-to-end supplier check.
- Capture the live response and search IDs.
- Record a two to four minute public demo.
- Add the SerpApi challenge to the existing Devpost submission.
