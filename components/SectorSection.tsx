import PortfolioTable from "@/components/PortfolioTable";
import type { PortfolioRow, SectorSummary } from "@/types/market";
import { formatCurrency } from "@/lib/formatters";

interface SectorSectionProps {
  summary: SectorSummary;
  rows: PortfolioRow[];
}

export default function SectorSection({
  summary,
  rows,
}: SectorSectionProps) {
  const isGain =
    summary.totalGainLoss !== null && summary.totalGainLoss >= 0;

  const gainLossColor = isGain
    ? "text-emerald-400"
    : "text-red-400";

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <header className="flex flex-col gap-4 border-b border-slate-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {summary.sector} Sector
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? "holding" : "holdings"}
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-xs text-slate-500">Investment</p>
            <p className="mt-1 font-medium text-slate-200">
              {formatCurrency(summary.totalInvestment)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Present Value</p>
            <p className="mt-1 font-medium text-slate-200">
              {formatCurrency(summary.totalPresentValue)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Gain/Loss</p>
            <p className={`mt-1 font-medium ${gainLossColor}`}>
              {formatCurrency(summary.totalGainLoss)}
            </p>
          </div>
        </div>
      </header>

      <PortfolioTable rows={rows} />
    </section>
  );
}