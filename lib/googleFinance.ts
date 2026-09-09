import { load } from "cheerio";
import type { FundamentalData } from "@/types/market";

const SUCCESS_CACHE_DURATION_MS = 6 * 60 * 60 * 1000;
const FAILURE_CACHE_DURATION_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;
const CONCURRENCY_LIMIT = 5;

interface FundamentalsCacheEntry {
  data: FundamentalData;
  expiresAt: number;
}

const fundamentalsCache = new Map<string, FundamentalsCacheEntry>();

function parseFinancialNumber(value: string): number | null {
  const normalizedValue = value.replace(/[₹,%]/g, "").replace(/,/g, "").trim();

  if (
    normalizedValue === "" ||
    normalizedValue === "-" ||
    normalizedValue.toLowerCase() === "n/a"
  ) {
    return null;
  }

  const parsedValue = Number.parseFloat(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function extractFundamentals(
  html: string,
): Pick<FundamentalData, "peRatio" | "latestEarnings"> {
  const $ = load(html);

  let peRatio: number | null = null;
  let latestEarnings: number | null = null;

  $("div.gyFHrc").each((_, element) => {
    const label = $(element)
      .find(".mfs7Fc")
      .first()
      .text()
      .trim()
      .toLowerCase();

    const value = $(element).find(".P6K39c").first().text().trim();

    if (label === "p/e ratio") {
      peRatio = parseFinancialNumber(value);
    }

    if (label === "eps") {
      latestEarnings = parseFinancialNumber(value);
    }
  });

  const pageText = $("body").text().replace(/\s+/g, " ");

  if (peRatio === null) {
    const peMatch = pageText.match(/P\/E ratio\s*([₹\d,.-]+)/i);

    if (peMatch) {
      peRatio = parseFinancialNumber(peMatch[1]);
    }
  }

  if (latestEarnings === null) {
    const epsMatch = pageText.match(/EPS\s*₹\s*(-?[\d,]+(?:\.\d+)?)/i);

    if (epsMatch) {
      latestEarnings = Number(epsMatch[1].replace(/,/g, ""));
    }
  }

  return {
    peRatio,
    latestEarnings,
  };
}

function createUnavailableFundamentals(error: string): FundamentalData {
  return {
    peRatio: null,
    latestEarnings: null,
    fetchedAt: null,
    status: "unavailable",
    error,
  };
}

async function fetchGoogleFundamentals(
  symbol: string,
): Promise<FundamentalData> {
  const cachedEntry = fundamentalsCache.get(symbol);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return {
      ...cachedEntry.data,
      status:
        cachedEntry.data.status === "live" ? "cached" : cachedEntry.data.status,
    };
  }

  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url =
      `https://www.google.com/finance/quote/` +
      `${encodeURIComponent(symbol)}?hl=en`;

    const response = await fetch(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Google Finance returned ${response.status}`);
    }

    const html = await response.text();

    const { peRatio, latestEarnings } = extractFundamentals(html);

    const data: FundamentalData = {
      peRatio,
      latestEarnings,
      fetchedAt: new Date().toISOString(),
      status:
        peRatio !== null || latestEarnings !== null ? "live" : "unavailable",
      error:
        peRatio === null && latestEarnings === null
          ? "P/E ratio and EPS are unavailable"
          : undefined,
    };

    fundamentalsCache.set(symbol, {
      data,
      expiresAt:
        Date.now() +
        (data.status === "live"
          ? SUCCESS_CACHE_DURATION_MS
          : FAILURE_CACHE_DURATION_MS),
    });

    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google Finance request failed";

    const data = createUnavailableFundamentals(message);

    fundamentalsCache.set(symbol, {
      data,
      expiresAt: Date.now() + FAILURE_CACHE_DURATION_MS,
    });

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getGoogleFundamentals(
  symbols: string[],
): Promise<Record<string, FundamentalData>> {
  const results: Record<string, FundamentalData> = {};

  for (let index = 0; index < symbols.length; index += CONCURRENCY_LIMIT) {
    const symbolBatch = symbols.slice(index, index + CONCURRENCY_LIMIT);

    const batchResults = await Promise.all(
      symbolBatch.map(async (symbol) => {
        const data = await fetchGoogleFundamentals(symbol);

        return {
          symbol,
          data,
        };
      }),
    );

    for (const result of batchResults) {
      results[result.symbol] = result.data;
    }
  }

  return results;
}
