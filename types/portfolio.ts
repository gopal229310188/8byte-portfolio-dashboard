export type Sector =
  | "Financial"
  | "Technology"
  | "Consumer"
  | "Power"
  | "Pipe"
  | "Others";

export type Exchange = "NSE" | "BSE";

export interface PortfolioHolding {
  id: string;
  name: string;
  sector: Sector;
  purchasePrice: number;
  quantity: number;
  exchange: Exchange;
  exchangeCode: string;
  yahooSymbol: string;
  googleSymbol: string;
}