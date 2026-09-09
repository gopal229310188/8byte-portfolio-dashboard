import type { PortfolioHolding, Sector } from "@/types/portfolio";

export type DataStatus =
  | "live"
  | "cached"
  | "stale"
  | "mock"
  | "unavailable";

export interface MarketData {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  currency: "INR";
  fetchedAt: string | null;
  status: DataStatus;
  error?: string;
}

export interface PortfolioRow extends PortfolioHolding {
  investment: number;
  portfolioPercentage: number;
  market: MarketData;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercentage: number | null;
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  gainLossPercentage: number | null;
  pricedHoldings: number;
  totalHoldings: number;
}

export interface SectorSummary extends PortfolioSummary {
  sector: Sector;
}

export interface PortfolioApiResponse {
  rows: PortfolioRow[];
  summary: PortfolioSummary;
  sectors: SectorSummary[];
  meta: {
  source: string;
  fundamentalsSource?: string;
  requestedAt: string | null;
  refreshIntervalSeconds: number;
  };
}

export interface FundamentalData {
  peRatio: number | null;
  latestEarnings: number | null;
  fetchedAt: string | null;
  status: DataStatus;
  error?: string;
}