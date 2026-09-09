import YahooFinance from "yahoo-finance2";
import type { MarketData } from "@/types/market";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

const CACHE_DURATION_MS = 15_000;

interface MarketDataCache {
  expiresAt: number;
  data: Record<string, MarketData>;
}

let marketDataCache: MarketDataCache | null = null;

function createUnavailableMarketData(
  error: string,
): MarketData {
  return {
    cmp: null,
    peRatio: null,
    latestEarnings: null,
    currency: "INR",
    fetchedAt: null,
    status: "unavailable",
    error,
  };
}

function markDataAsCached(
  data: Record<string, MarketData>,
): Record<string, MarketData> {
  return Object.fromEntries(
    Object.entries(data).map(([symbol, marketData]) => [
      symbol,
      {
        ...marketData,
        status:
          marketData.status === "live"
            ? "cached"
            : marketData.status,
      },
    ]),
  );
}

export async function getYahooMarketData(
  symbols: string[],
): Promise<Record<string, MarketData>> {
  const now = Date.now();

  if (
    marketDataCache &&
    marketDataCache.expiresAt > now
  ) {
    return markDataAsCached(marketDataCache.data);
  }

  const fetchedAt = new Date().toISOString();

  try {
    const quotes = await yahooFinance.quote(symbols, {
      return: "object",
    });

    const marketData = Object.fromEntries(
      symbols.map((symbol) => {
        const quote = quotes[symbol];

        if (
          !quote ||
          typeof quote.regularMarketPrice !== "number"
        ) {
          return [
            symbol,
            createUnavailableMarketData(
              "Current market price is unavailable",
            ),
          ];
        }

        const data: MarketData = {
          cmp: quote.regularMarketPrice,
          peRatio: null,
          latestEarnings: null,
          currency: "INR",
          fetchedAt,
          status: "live",
        };

        return [symbol, data];
      }),
    );

    marketDataCache = {
      data: marketData,
      expiresAt: now + CACHE_DURATION_MS,
    };

    return marketData;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Yahoo Finance request failed";

    return Object.fromEntries(
      symbols.map((symbol) => [
        symbol,
        createUnavailableMarketData(message),
      ]),
    );
  }
}