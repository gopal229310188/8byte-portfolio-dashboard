import { describe, expect, it } from "vitest";

import type { MarketData } from "../types/market";
import type { PortfolioHolding } from "../types/portfolio";
import {
  buildPortfolioRows,
  calculateGainLoss,
  calculateGainLossPercentage,
  calculateInvestment,
  calculatePortfolioPercentage,
  calculatePortfolioSummary,
  calculatePresentValue,
  calculateSectorSummaries,
  calculateTotalInvestment,
  createPortfolioRow,
} from "./portfolioCalculations";

const firstHolding: PortfolioHolding = {
  id: "test-bank",
  name: "Test Bank",
  sector: "Financial",
  purchasePrice: 100,
  quantity: 10,
  exchange: "NSE",
  exchangeCode: "TESTBANK",
  yahooSymbol: "TESTBANK.NS",
  googleSymbol: "TESTBANK:NSE",
};

const secondHolding: PortfolioHolding = {
  id: "test-tech",
  name: "Test Technology",
  sector: "Technology",
  purchasePrice: 200,
  quantity: 5,
  exchange: "NSE",
  exchangeCode: "TESTTECH",
  yahooSymbol: "TESTTECH.NS",
  googleSymbol: "TESTTECH:NSE",
};

const liveMarketData: MarketData = {
  cmp: 120,
  peRatio: 20,
  latestEarnings: 6,
  currency: "INR",
  fetchedAt: "2026-09-09T12:00:00.000Z",
  status: "live",
};

describe("basic portfolio calculations", () => {
  it("calculates the investment amount", () => {
    expect(calculateInvestment(100, 10)).toBe(1000);
  });

  it("calculates the total investment across holdings", () => {
    expect(calculateTotalInvestment([firstHolding, secondHolding])).toBe(2000);
  });

  it("calculates portfolio allocation percentage", () => {
    expect(calculatePortfolioPercentage(250, 1000)).toBe(25);
  });

  it("returns zero allocation when total investment is zero", () => {
    expect(calculatePortfolioPercentage(100, 0)).toBe(0);
  });

  it("calculates present value using CMP and quantity", () => {
    expect(calculatePresentValue(120, 10)).toBe(1200);
  });

  it("returns null present value when CMP is unavailable", () => {
    expect(calculatePresentValue(null, 10)).toBeNull();
  });

  it("calculates gain or loss", () => {
    expect(calculateGainLoss(1200, 1000)).toBe(200);
    expect(calculateGainLoss(800, 1000)).toBe(-200);
  });

  it("returns null gain or loss when present value is unavailable", () => {
    expect(calculateGainLoss(null, 1000)).toBeNull();
  });

  it("calculates gain or loss percentage", () => {
    expect(calculateGainLossPercentage(200, 1000)).toBe(20);

    expect(calculateGainLossPercentage(-200, 1000)).toBe(-20);
  });

  it("returns null percentage for missing gain or zero investment", () => {
    expect(calculateGainLossPercentage(null, 1000)).toBeNull();

    expect(calculateGainLossPercentage(100, 0)).toBeNull();
  });
});

describe("portfolio row creation", () => {
  it("creates a complete calculated portfolio row", () => {
    const row = createPortfolioRow(firstHolding, liveMarketData, 2000);

    expect(row.investment).toBe(1000);
    expect(row.portfolioPercentage).toBe(50);
    expect(row.presentValue).toBe(1200);
    expect(row.gainLoss).toBe(200);
    expect(row.gainLossPercentage).toBe(20);
    expect(row.market).toEqual(liveMarketData);
  });

  it("uses unavailable market data when a symbol is missing", () => {
    const rows = buildPortfolioRows([firstHolding], {});

    expect(rows).toHaveLength(1);
    expect(rows[0].market.status).toBe("unavailable");
    expect(rows[0].market.cmp).toBeNull();
    expect(rows[0].presentValue).toBeNull();
    expect(rows[0].gainLoss).toBeNull();
    expect(rows[0].gainLossPercentage).toBeNull();
  });

  it("builds rows using market data matched by Yahoo symbol", () => {
    const rows = buildPortfolioRows([firstHolding, secondHolding], {
      "TESTBANK.NS": liveMarketData,
      "TESTTECH.NS": {
        ...liveMarketData,
        cmp: 220,
      },
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].presentValue).toBe(1200);
    expect(rows[1].presentValue).toBe(1100);
    expect(rows[0].portfolioPercentage).toBe(50);
    expect(rows[1].portfolioPercentage).toBe(50);
  });
});

describe("portfolio summaries", () => {
  it("calculates totals when every holding has a market price", () => {
    const rows = buildPortfolioRows([firstHolding, secondHolding], {
      "TESTBANK.NS": liveMarketData,
      "TESTTECH.NS": {
        ...liveMarketData,
        cmp: 220,
      },
    });

    const summary = calculatePortfolioSummary(rows);

    expect(summary.totalInvestment).toBe(2000);
    expect(summary.totalPresentValue).toBe(2300);
    expect(summary.totalGainLoss).toBe(300);
    expect(summary.gainLossPercentage).toBe(15);
    expect(summary.pricedHoldings).toBe(2);
    expect(summary.totalHoldings).toBe(2);
  });

  it("returns partial-data totals safely when a price is missing", () => {
    const rows = buildPortfolioRows([firstHolding, secondHolding], {
      "TESTBANK.NS": liveMarketData,
    });

    const summary = calculatePortfolioSummary(rows);

    expect(summary.totalInvestment).toBe(2000);
    expect(summary.totalPresentValue).toBeNull();
    expect(summary.totalGainLoss).toBeNull();
    expect(summary.gainLossPercentage).toBeNull();
    expect(summary.pricedHoldings).toBe(1);
    expect(summary.totalHoldings).toBe(2);
  });

  it("handles an empty portfolio", () => {
    expect(calculatePortfolioSummary([])).toEqual({
      totalInvestment: 0,
      totalPresentValue: null,
      totalGainLoss: null,
      gainLossPercentage: null,
      pricedHoldings: 0,
      totalHoldings: 0,
    });
  });
});

describe("sector summaries", () => {
  it("returns summaries for every supported sector", () => {
    const rows = buildPortfolioRows([firstHolding, secondHolding], {
      "TESTBANK.NS": liveMarketData,
      "TESTTECH.NS": {
        ...liveMarketData,
        cmp: 220,
      },
    });

    const summaries = calculateSectorSummaries(rows);

    expect(summaries).toHaveLength(6);
    expect(summaries.map((summary) => summary.sector)).toEqual([
      "Financial",
      "Technology",
      "Consumer",
      "Power",
      "Pipe",
      "Others",
    ]);

    const financialSummary = summaries.find(
      (summary) => summary.sector === "Financial",
    );

    const technologySummary = summaries.find(
      (summary) => summary.sector === "Technology",
    );

    expect(financialSummary?.totalInvestment).toBe(1000);
    expect(financialSummary?.totalPresentValue).toBe(1200);
    expect(technologySummary?.totalInvestment).toBe(1000);
    expect(technologySummary?.totalPresentValue).toBe(1100);
  });
});
