interface SerpOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
  date?: string;
}

interface SerpResponse {
  error?: string;
  search_metadata?: { id?: string; status?: string };
  organic_results?: SerpOrganicResult[];
  news_results?: SerpOrganicResult[];
}

export interface VendorIntelResult {
  supplier: string;
  identity: {
    status: "matched" | "unverified";
    sources: SerpOrganicResult[];
  };
  adverseNews: SerpOrganicResult[];
  searchIds: string[];
  checkedAt: string;
  provider: "SerpApi";
}

const genericSupplierWords = new Set([
  "company",
  "corporation",
  "inc",
  "llc",
  "ltd",
  "office",
  "products",
  "safety",
  "supply",
  "supplies",
  "the",
]);

const adverseTerms = [
  "breach",
  "charged",
  "charges",
  "fraud",
  "investigation",
  "lawsuit",
  "recall",
  "sanction",
  "scam",
  "settlement",
  "sued",
  "violation",
];

function identityTokens(supplier: string): string[] {
  const tokens = supplier
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !genericSupplierWords.has(token));
  return tokens.length > 0 ? tokens : supplier.toLowerCase().split(/\s+/).slice(0, 2);
}

function compactSource(result: SerpOrganicResult): SerpOrganicResult {
  return {
    title: result.title,
    link: result.link,
    snippet: result.snippet,
    source: result.source,
    date: result.date,
  };
}

export function supplierIdentityQuery(supplier: string): string {
  return `"${identityTokens(supplier).join(" ")}" official company`;
}

export function summarizeVendorIntel(
  supplier: string,
  identityResponse: SerpResponse,
  newsResponse: SerpResponse,
  checkedAt = new Date().toISOString(),
): VendorIntelResult {
  const tokens = identityTokens(supplier);
  const identitySources = (identityResponse.organic_results ?? [])
    .filter((result) => {
      const text = `${result.title ?? ""} ${result.snippet ?? ""}`.toLowerCase();
      return tokens.every((token) => text.includes(token));
    })
    .slice(0, 3)
    .map(compactSource);

  return {
    supplier,
    identity: {
      status: identitySources.length > 0 ? "matched" : "unverified",
      sources: identitySources,
    },
    adverseNews: (newsResponse.news_results ?? newsResponse.organic_results ?? [])
      .filter((result) => {
        const text = `${result.title ?? ""} ${result.snippet ?? ""}`.toLowerCase();
        const namesSupplier = tokens.every((token) => text.includes(token));
        const namesAdverseEvent = adverseTerms.some((term) => text.includes(term));
        return namesSupplier && namesAdverseEvent;
      })
      .slice(0, 5)
      .map(compactSource),
    searchIds: [
      identityResponse.search_metadata?.id,
      newsResponse.search_metadata?.id,
    ].filter((value): value is string => Boolean(value)),
    checkedAt,
    provider: "SerpApi",
  };
}

async function serpSearch(
  apiKey: string,
  query: string,
  searchType?: "nws",
): Promise<SerpResponse> {
  const params = new URLSearchParams({
    api_key: apiKey,
    engine: "google",
    q: query,
    hl: "en",
    gl: "us",
    output: "json",
  });
  if (searchType) params.set("tbm", searchType);

  const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
    headers: { accept: "application/json" },
  });
  const body = (await response.json()) as SerpResponse;
  if (
    response.ok &&
    body.error?.toLowerCase().includes("hasn't returned any results")
  ) {
    return {
      ...body,
      error: undefined,
      organic_results: [],
      news_results: [],
    };
  }
  if (!response.ok || body.error) {
    throw new Error(body.error ?? `SerpApi request failed with ${response.status}`);
  }
  return body;
}

export async function researchVendor(supplier: string): Promise<VendorIntelResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_API_KEY is required for supplier research");

  const [identityResponse, newsResponse] = await Promise.all([
    serpSearch(apiKey, supplierIdentityQuery(supplier)),
    serpSearch(apiKey, `"${supplier}" fraud OR scam OR lawsuit OR recall OR breach`, "nws"),
  ]);

  return summarizeVendorIntel(supplier, identityResponse, newsResponse);
}
