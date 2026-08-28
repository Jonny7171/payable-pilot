import assert from "node:assert/strict";
import test from "node:test";
import { summarizeVendorIntel } from "../src/vendor-intel.js";

test("keeps supplier identity conclusions tied to matching sources", () => {
  const result = summarizeVendorIntel(
    "Northstar Safety Supply",
    {
      search_metadata: { id: "identity-search" },
      organic_results: [
        {
          title: "Northstar official supplier portal",
          link: "https://northstar.example",
          snippet: "Northstar provides industrial equipment.",
        },
        { title: "Unrelated company", link: "https://other.example" },
      ],
    },
    {
      search_metadata: { id: "news-search" },
      news_results: [
        { title: "Northstar opens a warehouse", link: "https://news.example" },
      ],
    },
    "2026-08-28T12:00:00.000Z",
  );

  assert.equal(result.identity.status, "matched");
  assert.equal(result.identity.sources.length, 1);
  assert.equal(result.adverseNews.length, 1);
  assert.deepEqual(result.searchIds, ["identity-search", "news-search"]);
});

test("reports an unverified identity without inventing a fraud finding", () => {
  const result = summarizeVendorIntel(
    "Northstar Safety Supply",
    { organic_results: [{ title: "Different business" }] },
    { news_results: [] },
  );

  assert.equal(result.identity.status, "unverified");
  assert.deepEqual(result.identity.sources, []);
  assert.deepEqual(result.adverseNews, []);
});
