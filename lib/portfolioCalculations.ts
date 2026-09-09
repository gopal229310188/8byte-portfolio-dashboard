import type { MarketData, PortfolioRow, PortfolioSummary, SectorSummary } from "@/types/market";
import type { PortfolioHolding, Sector } from "@/types/portfolio";

const sectors: Sector[] = [
  "Financial",
  "Technology",
  "Consumer",
  "Power",
  "Pipe",
  "Others",
];

const unavailableMarketData: MarketData = {
  cmp: null,
  peRatio: null,
  latestEarnings: null,
  currency: "INR",
  fetchedAt: null,
  status: "unavailable",
};

export function calculateInvestment(
  purchasePrice: number,
  quantity: number,
): number {
  return purchasePrice * quantity;
}

export function calculateTotalInvestment(
  holdings: PortfolioHolding[],
): number {
  return holdings.reduce(
    (total, holding) =>
      total + calculateInvestment(holding.purchasePrice, holding.quantity),
    0,
  );
}

export function calculatePortfolioPercentage(
  investment: number,
  totalInvestment: number,
): number {
  if (totalInvestment === 0) {
    return 0;
  }

  return (investment / totalInvestment) * 100;
}

export function calculatePresentValue(
  cmp: number | null,
  quantity: number,
): number | null {
  if (cmp === null) {
    return null;
  }

  return cmp * quantity;
}

export function calculateGainLoss(
  presentValue: number | null,
  investment: number,
): number | null {
  if (presentValue === null) {
    return null;
  }

  return presentValue - investment;
}

export function calculateGainLossPercentage(
  gainLoss: number | null,
  investment: number,
): number | null {
  if (gainLoss === null || investment === 0) {
    return null;
  }

  return (gainLoss / investment) * 100;
}

export function createPortfolioRow(
  holding: PortfolioHolding,
  market: MarketData,
  totalInvestment: number,
): PortfolioRow {
  const investment = calculateInvestment(
    holding.purchasePrice,
    holding.quantity,
  );

  const presentValue = calculatePresentValue(
    market.cmp,
    holding.quantity,
  );

  const gainLoss = calculateGainLoss(presentValue, investment);

  return {
    ...holding,
    investment,
    portfolioPercentage: calculatePortfolioPercentage(
      investment,
      totalInvestment,
    ),
    market,
    presentValue,
    gainLoss,
    gainLossPercentage: calculateGainLossPercentage(
      gainLoss,
      investment,
    ),
  };
}

export function buildPortfolioRows(
  holdings: PortfolioHolding[],
  marketDataBySymbol: Record<string, MarketData>,
): PortfolioRow[] {
  const totalInvestment = calculateTotalInvestment(holdings);

  return holdings.map((holding) => {
    const market =
      marketDataBySymbol[holding.yahooSymbol] ?? unavailableMarketData;

    return createPortfolioRow(holding, market, totalInvestment);
  });
}

export function calculateSummary(
  rows: PortfolioRow[],
): PortfolioSummary {
  const totalInvestment = rows.reduce(
    (total, row) => total + row.investment,
    0,
  );

  const pricedRows = rows.filter(
    (row) => row.presentValue !== null,
  );

  const hasCompleteMarketData =
    rows.length > 0 && pricedRows.length === rows.length;

  if (!hasCompleteMarketData) {
    return {
      totalInvestment,
      totalPresentValue: null,
      totalGainLoss: null,
      gainLossPercentage: null,
      pricedHoldings: pricedRows.length,
      totalHoldings: rows.length,
    };
  }

  const totalPresentValue = pricedRows.reduce(
    (total, row) => total + (row.presentValue ?? 0),
    0,
  );

  const totalGainLoss = totalPresentValue - totalInvestment;

  return {
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    gainLossPercentage:
      totalInvestment === 0
        ? null
        : (totalGainLoss / totalInvestment) * 100,
    pricedHoldings: pricedRows.length,
    totalHoldings: rows.length,
  };
}

export function calculateSectorSummaries(
  rows: PortfolioRow[],
): SectorSummary[] {
  return sectors.map((sector) => {
    const sectorRows = rows.filter(
      (row) => row.sector === sector,
    );

    return {
      sector,
      ...calculateSummary(sectorRows),
    };
  });
}