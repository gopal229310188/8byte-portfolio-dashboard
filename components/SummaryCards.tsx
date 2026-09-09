import type { PortfolioSummary } from "@/types/market";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface SummaryCardsProps {
  summary: PortfolioSummary;
}

export default function SummaryCards({
  summary,
}: SummaryCardsProps) {
  const isGain =
    summary.totalGainLoss !== null && summary.totalGainLoss >= 0;

  const gainLossColor = isGain
    ? "text-emerald-400"
    : "text-red-400";

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Total Investment</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatCurrency(summary.totalInvestment)}
        </p>
      </article>

      <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Present Value</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatCurrency(summary.totalPresentValue)}
        </p>
      </article>

      <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Total Gain/Loss</p>
        <p className={`mt-2 text-2xl font-semibold ${gainLossColor}`}>
          {formatCurrency(summary.totalGainLoss)}
        </p>
      </article>

      <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Overall Return</p>
        <p className={`mt-2 text-2xl font-semibold ${gainLossColor}`}>
          {formatPercentage(summary.gainLossPercentage)}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {summary.pricedHoldings} of {summary.totalHoldings} holdings priced
        </p>
      </article>
    </section>
  );
}