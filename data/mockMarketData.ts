import type { MarketData } from "@/types/market";

function createMockMarketData(
  cmp: number | null,
  peRatio: number | null,
  latestEarnings: number | null,
): MarketData {
  return {
    cmp,
    peRatio,
    latestEarnings,
    currency: "INR",
    fetchedAt: null,
    status: "mock",
  };
}

export const mockMarketDataBySymbol: Record<string, MarketData> = {
  // Financial Sector
  "HDFCBANK.NS": createMockMarketData(1700.15, 18.69, 91.02),
  "BAJFINANCE.NS": createMockMarketData(8419.6, 32.63, 257.8),
  "ICICIBANK.NS": createMockMarketData(1215.5, 17.68, 68.72),
  "BAJAJHFL.NS": createMockMarketData(112.85, 85.72, 2.53),
  "511577.BO": createMockMarketData(14.86, null, null),

  // Technology Sector
  "AFFLE.NS": createMockMarketData(1459.6, 55.53, 26.11),
  "LTM.NS": createMockMarketData(4793.8, 34.69, 145.92),
  "KPITTECH.NS": createMockMarketData(1293.1, 46.57, 27.77),
  "TATATECH.NS": createMockMarketData(662, 41.68, 15.88),
  "BLSE.NS": createMockMarketData(152.9, 26.3, 5.8),
  "TANLA.NS": createMockMarketData(449.5, 11.64, 39.48),

  // Consumer Sector
  "DMART.NS": createMockMarketData(3451.1, 82.63, 41.75),
  "TATACONSUM.NS": createMockMarketData(961.1, 26.56, 134.77),
  "PIDILITIND.NS": createMockMarketData(2730, 71.13, 38.36),

  // Power Sector
  "TATAPOWER.NS": createMockMarketData(351, 29.36, 11.94),
  "KPIGREEN.NS": createMockMarketData(402.4, 29.26, 13.75),
  "SUZLON.NS": createMockMarketData(51.36, 61.25, 0.84),
  "GENSOL.NS": createMockMarketData(372.6, 39.51, 5.57),

  // Pipe Sector
  "HARIOMPIPE.NS": createMockMarketData(355.75, 17.98, 19.78),
  "ASTRAL.NS": createMockMarketData(1317.6, 67.13, 19.59),
  "POLYCAB.NS": createMockMarketData(5000, 40.91, 121.97),

  // Other Holdings
  "CLEAN.NS": createMockMarketData(1237.45, 50.37, 24.52),
  "DEEPAKNTR.NS": createMockMarketData(1927.9, 41.86, 37.26),
  "FINEORG.NS": createMockMarketData(3743, 41.86, 37.26),
  "GRAVITA.NS": createMockMarketData(1614.2, 41.86, 37.26),
  "SBILIFE.NS": createMockMarketData(1405.45, null, -5.82),
};