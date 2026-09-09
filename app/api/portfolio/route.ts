import { holdings } from "@/data/holdings";
import {
  buildPortfolioRows,
  calculatePortfolioSummary,
  calculateSectorSummaries,
} from "@/lib/portfolioCalculations";
import { getYahooMarketData } from "@/lib/yahooFinance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const symbols = holdings.map(
      (holding) => holding.yahooSymbol,
    );

    const marketData = await getYahooMarketData(symbols);

    const rows = buildPortfolioRows(
      holdings,
      marketData,
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