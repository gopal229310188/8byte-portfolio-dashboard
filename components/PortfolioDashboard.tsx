"use client";

import { useCallback, useEffect, useState } from "react";
import SectorSection from "@/components/SectorSection";
import SummaryCards from "@/components/SummaryCards";
import type { PortfolioApiResponse } from "@/types/market";

interface PortfolioDashboardProps {
  initialData: PortfolioApiResponse;
}

export default function PortfolioDashboard({
  initialData,
}: PortfolioDashboardProps) {
  const [portfolioData, setPortfolioData] =
    useState<PortfolioApiResponse>(initialData);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPortfolio = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/portfolio", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Portfolio request failed with status ${response.status}`,
        );
      }

      const data: PortfolioApiResponse = await response.json();

      setPortfolioData(data);
      setError(null);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to refresh portfolio data";

      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
  const initialRefreshId = window.setTimeout(
    () => void refreshPortfolio(),
    0,
  );

  const intervalId = window.setInterval(
    () => void refreshPortfolio(),
    initialData.meta.refreshIntervalSeconds * 1000,
  );

  return () => {
    window.clearTimeout(initialRefreshId);
    window.clearInterval(intervalId);
  };
}, [
  initialData.meta.refreshIntervalSeconds,
  refreshPortfolio,
]);

  const hasUnavailablePrices = portfolioData.rows.some(
    (row) => row.market.cmp === null,
  );

  const hasLivePrices = portfolioData.rows.some(
    (row) => row.market.status === "live",
  );

  let statusLabel = "Mock market data";
  let statusStyle =
    "border-amber-500/30 bg-amber-500/10 text-amber-300";
  let indicatorStyle = "bg-amber-400";

  if (hasUnavailablePrices) {
    statusLabel = "Partial market data";
    statusStyle =
      "border-red-500/30 bg-red-500/10 text-red-300";
    indicatorStyle = "bg-red-400";
  } else if (hasLivePrices) {
    statusLabel = "Live Yahoo data";
    statusStyle =
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    indicatorStyle = "bg-emerald-400";
  } else if (portfolioData.meta.source === "Yahoo Finance") {
    statusLabel = "Cached Yahoo data";
    statusStyle =
      "border-blue-500/30 bg-blue-500/10 text-blue-300";
    indicatorStyle = "bg-blue-400";
  }

  const lastUpdated = portfolioData.meta.requestedAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "Asia/Kolkata",
      }).format(new Date(portfolioData.meta.requestedAt))
    : "Waiting for live data";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
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

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyle}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${indicatorStyle}`}
                />
                {statusLabel}
              </span>

              <p className="mt-2 text-xs text-slate-500">
                Updated: {lastUpdated}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refreshPortfolio()}
              disabled={isRefreshing}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            Live refresh failed. Displaying the last available portfolio
            data. {error}
          </div>
        )}

        <SummaryCards summary={portfolioData.summary} />

        <div className="mt-8 space-y-6">
          {portfolioData.sectors.map((sectorSummary) => {
            const sectorRows = portfolioData.rows.filter(
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
          Market information is provided for demonstration purposes and
          may be delayed.
        </footer>
      </div>
    </main>
  );
}