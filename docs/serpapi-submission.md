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

## Live proof completed August 30, 2026

- The real Strands loop called `research_supplier_risk` before escalating PP-2086.
- SerpApi returned search IDs `6a94df93f5d5ac5b25f68c31` and `6a94df9369819d77d048cb02`.
- The fictional supplier remained unverified and no adverse claim was made.
- PP-2087 cleared and PP-2086 stayed behind the human approval boundary.
- All 14 tests passed.
- Public evidence: https://jonny7171.github.io/payable-pilot/proof/strands-serpapi-run.json

## Still to do

- Record a new public demo that shows the live supplier view and evidence file.
- Update the existing Devpost story and media.
- Add the SerpApi challenge if the submission form still permits it.
