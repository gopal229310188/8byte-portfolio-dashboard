import PortfolioDashboard from "@/components/PortfolioDashboard";
import { holdings } from "@/data/holdings";
import { mockMarketDataBySymbol } from "@/data/mockMarketData";
import {
  buildPortfolioRows,
  calculatePortfolioSummary,
  calculateSectorSummaries,
} from "@/lib/portfolioCalculations";
import type { PortfolioApiResponse } from "@/types/market";

export default function Home() {
  const rows = buildPortfolioRows(
    holdings,
    mockMarketDataBySymbol,
  );

  const initialData: PortfolioApiResponse = {
    rows,
    summary: calculatePortfolioSummary(rows),
    sectors: calculateSectorSummaries(rows),
    meta: {
      source: "Spreadsheet mock data",
      requestedAt: null,
      refreshIntervalSeconds: 15,
    },
  };

  return <PortfolioDashboard initialData={initialData} />;
}