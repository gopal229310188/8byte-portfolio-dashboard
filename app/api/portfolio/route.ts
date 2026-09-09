import { holdings } from "@/data/holdings";
import { getGoogleFundamentals } from "@/lib/googleFinance";
import {
  buildPortfolioRows,
  calculatePortfolioSummary,
  calculateSectorSummaries,
} from "@/lib/portfolioCalculations";
import { getYahooMarketData } from "@/lib/yahooFinance";
import type { MarketData } from "@/types/market";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const yahooSymbols = holdings.map(
      (holding) => holding.yahooSymbol,
    );

    const googleSymbols = holdings.map(
      (holding) => holding.googleSymbol,
    );

    const [yahooMarketData, googleFundamentals] =
      await Promise.all([
        getYahooMarketData(yahooSymbols),
        getGoogleFundamentals(googleSymbols),
      ]);

    const combinedMarketData: Record<string, MarketData> =
      Object.fromEntries(
        holdings.map((holding) => {
          const priceData =
            yahooMarketData[holding.yahooSymbol];

          const fundamentalData =
            googleFundamentals[holding.googleSymbol];

          const errors = [
            priceData?.error,
            fundamentalData?.error,
          ].filter(Boolean);

          const marketData: MarketData = {
            ...priceData,
            peRatio: fundamentalData?.peRatio ?? null,
            latestEarnings:
              fundamentalData?.latestEarnings ?? null,
            error:
              errors.length > 0
                ? errors.join("; ")
                : undefined,
          };

          return [holding.yahooSymbol, marketData];
        }),
      );

    const rows = buildPortfolioRows(
      holdings,
      combinedMarketData,
    );

    const summary =
      calculatePortfolioSummary(rows);

    const sectors =
      calculateSectorSummaries(rows);

    return Response.json(
      {
        rows,
        summary,
        sectors,
        meta: {
          source: "Yahoo Finance",
          fundamentalsSource: "Google Finance",
          requestedAt: new Date().toISOString(),
          refreshIntervalSeconds: 15,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error";

    return Response.json(
      {
        error: "Unable to build portfolio data",
        message,
      },
      {
        status: 500,
      },
    );
  }
}