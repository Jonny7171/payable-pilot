# WebMCP demo narration

PayablePilot already handled the invoice queue. For this challenge, I added
WebMCP so a browser agent can work with the page without guessing at buttons or
scraping a dashboard.

The first tool, `review_payables_queue`, returns the current run and the source
evidence. One packet cleared. PP-2086 stopped because eight units were invoiced
at one hundred nineteen dollars instead of the ninety-four-dollar purchase
order rate. The difference is two hundred dollars, calculated in code.

The second tool stages one of the two choices already allowed by the page. Here
I ask it to request a credit and hold the invoice. The page moves to the review
panel and shows an Agent Draft with the exact action.

That draft is not a payment decision. The agent cannot approve the exception,
release payment, or contact the supplier. A person checks the source evidence
and either confirms or dismisses it.

The implementation uses `document.modelContext.registerTool` with strict input
schemas. The queue tool is marked read-only. An AbortController handles the tool
lifecycle. The live site exposes both tools in ChatGPT's in-app browser, and the
repository includes seventeen passing tests.

