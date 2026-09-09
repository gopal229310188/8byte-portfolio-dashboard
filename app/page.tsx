import SectorSection from "@/components/SectorSection";
import SummaryCards from "@/components/SummaryCards";
import { holdings } from "@/data/holdings";
import { mockMarketDataBySymbol } from "@/data/mockMarketData";
import {
  buildPortfolioRows,
  calculatePortfolioSummary,
  calculateSectorSummaries,
} from "@/lib/portfolioCalculations";

export default function Home() {
  const portfolioRows = buildPortfolioRows(
    holdings,
    mockMarketDataBySymbol,
  );

  const portfolioSummary =
    calculatePortfolioSummary(portfolioRows);

  const sectorSummaries =
    calculateSectorSummaries(portfolioRows);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
              Investment Overview
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Portfolio Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor portfolio allocation, present value and performance
              across sectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Mock market data
            </span>
          </div>
        </header>

        <SummaryCards summary={portfolioSummary} />

        <div className="mt-8 space-y-6">
          {sectorSummaries.map((sectorSummary) => {
            const sectorRows = portfolioRows.filter(
              (row) => row.sector === sectorSummary.sector,
            );

            return (
              <SectorSection
                key={sectorSummary.sector}
                summary={sectorSummary}
                rows={sectorRows}
              />
            );
          })}
        </div>

        <footer className="mt-8 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          Market information is displayed for demonstration purposes only.
        </footer>
      </div>
    </main>
  );
}