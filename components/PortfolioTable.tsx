import type { PortfolioRow } from "@/types/market";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/lib/formatters";

interface PortfolioTableProps {
  rows: PortfolioRow[];
}

export default function PortfolioTable({
  rows,
}: PortfolioTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1450px] w-full text-left text-sm">
        <thead className="border-y border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Particulars</th>
            <th className="px-4 py-3 text-right">Purchase Price</th>
            <th className="px-4 py-3 text-right">Qty</th>
            <th className="px-4 py-3 text-right">Investment</th>
            <th className="px-4 py-3 text-right">Portfolio</th>
            <th className="px-4 py-3">NSE/BSE</th>
            <th className="px-4 py-3 text-right">CMP</th>
            <th className="px-4 py-3 text-right">Present Value</th>
            <th className="px-4 py-3 text-right">Gain/Loss</th>
            <th className="px-4 py-3 text-right">Gain/Loss %</th>
            <th className="px-4 py-3 text-right">P/E Ratio</th>
            <th className="px-4 py-3 text-right">Latest Earnings</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => {
            const isGain =
              row.gainLoss !== null && row.gainLoss >= 0;

            const gainLossColor = isGain
              ? "text-emerald-400"
              : "text-red-400";

            return (
              <tr
                key={row.id}
                className="transition-colors hover:bg-slate-800/40"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{row.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.yahooSymbol}
                  </p>
                </td>

                <td className="px-4 py-4 text-right text-slate-300">
                  {formatCurrency(row.purchasePrice)}
                </td>

                <td className="px-4 py-4 text-right text-slate-300">
                  {formatNumber(row.quantity, 0)}
                </td>

                <td className="px-4 py-4 text-right text-slate-300">
                  {formatCurrency(row.investment)}
                </td>

                <td className="px-4 py-4 text-right text-slate-300">
                  {formatPercentage(row.portfolioPercentage)}
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">
                    {row.exchange}: {row.exchangeCode}
                  </span>
                </td>

                <td className="px-4 py-4 text-right font-medium text-white">
                  {formatCurrency(row.market.cmp)}
                </td>

                <td className="px-4 py-4 text-right text-slate-300">
                  {formatCurrency(row.presentValue)}
                </td>

                <td
                  className={`px-4 py-4 text-right font-medium ${gainLossColor}`}
                >
                  {formatCurrency(row.gainLoss)}
                </td>

                <td
                  className={`px-4 py-4 text-right font-medium ${gainLossColor}`}
                >
                  {formatPercentage(row.gainLossPercentage)}
                </td>

                <td className="px-4 py-4 text-right text-slate-300">
                  {formatNumber(row.market.peRatio)}
                </td>

                <td className="px-4 py-4 text-right text-slate-300">
                  {formatNumber(row.market.latestEarnings)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}