# Portfolio Dashboard

A full-stack portfolio monitoring dashboard that calculates investment performance using live market prices and company fundamentals.

The application displays portfolio allocation, current market value, gain or loss, return percentage, P/E ratio, and latest earnings for 26 holdings grouped across six sectors.

## Features

- Live current market prices from Yahoo Finance
- P/E ratios and EPS data from Google Finance
- Portfolio-level investment and performance summary
- Sector-wise grouping and summaries
- Individual holding gain/loss calculations
- Automatic market-data refresh
- Manual refresh button
- Server-side caching to reduce external requests
- Graceful handling of unavailable or partial market data
- Responsive dashboard layout
- Type-safe implementation with TypeScript
- Automated unit tests for portfolio calculations

## Technology Stack

- Next.js 16 with the App Router
- React
- TypeScript
- Tailwind CSS
- Yahoo Finance API through `yahoo-finance2`
- Google Finance data extraction with Cheerio
- Vitest for unit testing
- Vercel for deployment

## Application Architecture

The application uses a full-stack Next.js architecture:

```text
Client Dashboard
       |
       | GET /api/portfolio
       v
Next.js API Route
       |
       +-- Yahoo Finance --> Current market prices
       |
       +-- Google Finance --> P/E ratio and EPS
       |
       v
Portfolio Calculation Layer
       |
       v
Structured Portfolio Response
```

The browser does not communicate with Yahoo Finance or Google Finance directly. External requests are handled by the server-side API route.

This approach:

- Keeps data-fetching logic separate from the UI
- Avoids browser cross-origin restrictions
- Allows caching and error handling on the server
- Provides one consistent response to the dashboard

## Portfolio Calculations

For every holding, the application calculates:

```text
Investment = Purchase Price × Quantity

Present Value = Current Market Price × Quantity

Gain/Loss = Present Value − Investment

Gain/Loss Percentage = (Gain/Loss ÷ Investment) × 100

Portfolio Percentage = (Holding Investment ÷ Total Investment) × 100
```

Portfolio and sector totals are calculated from the individual holding rows.

If the current price of any holding is unavailable, totals that require complete market data are displayed as unavailable instead of presenting misleading values.

## Market Data Integration

### Yahoo Finance

Yahoo Finance provides the current market price for each holding using its NSE or BSE symbol.

Examples:

```text
HDFCBANK.NS
BAJFINANCE.NS
511577.BO
```

Yahoo market data is cached briefly to avoid making unnecessary repeated requests while still keeping prices reasonably current.

### Google Finance

Google Finance provides:

- P/E ratio
- EPS, displayed as latest earnings

The server fetches each holding’s Google Finance page and extracts the required values using Cheerio.

Examples:

```text
HDFCBANK:NSE
BAJFINANCE:NSE
511577:BOM
```

Google Finance fundamentals are cached longer because these values do not change as frequently as market prices.

The integration uses:

- Controlled request concurrency
- Request timeouts
- Success caching
- Shorter failure caching
- Safe `null` values when fundamentals are unavailable

Because Google Finance does not provide an official public API for these fields, its page structure may change in the future and require parser updates.

## Data Statuses

Each holding can have one of the following market-data statuses:

- `live` – newly retrieved market data
- `cached` – recently retrieved data served from cache
- `unavailable` – current data could not be retrieved

The dashboard continues rendering even if one external request fails.

## API Endpoint

### Get portfolio data

```http
GET /api/portfolio
```

The endpoint returns:

```json
{
  "rows": [],
  "summary": {},
  "sectors": [],
  "meta": {
    "generatedAt": "ISO timestamp",
    "refreshIntervalSeconds": 15
  }
}
```

Each portfolio row contains:

- Holding details
- Purchase price
- Quantity
- Investment
- Portfolio allocation
- Current market price
- Present value
- Gain/loss
- Gain/loss percentage
- P/E ratio
- Latest earnings
- Market-data status

## Project Structure

```text
app/
  api/
    portfolio/
      route.ts
  globals.css
  layout.tsx
  page.tsx

components/
  PortfolioDashboard.tsx
  PortfolioTable.tsx
  SectorSection.tsx
  SummaryCards.tsx

data/
  holdings.ts
  mockMarketData.ts

lib/
  formatters.ts
  googleFinance.ts
  portfolioCalculations.ts
  portfolioCalculations.test.ts
  yahooFinance.ts

types/
  market.ts
  portfolio.ts
```

## Getting Started

### Prerequisites

Install:

- Node.js 20 or newer
- npm
- Git

### Clone the repository

```bash
git clone https://github.com/gopal229310188/8byte-portfolio-dashboard.git
cd 8byte-portfolio-dashboard
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The portfolio API can be inspected at:

```text
http://localhost:3000/api/portfolio
```

No environment variables or API keys are required.

## Available Commands

Run the development server:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Testing

Portfolio calculation logic is tested with Vitest.

The test suite covers:

- Investment calculations
- Total investment
- Portfolio allocation percentage
- Present value
- Positive and negative returns
- Gain/loss percentage
- Missing market prices
- Portfolio row creation
- Complete portfolio summaries
- Partial market-data handling
- Empty portfolio handling
- Sector summaries

Run the tests with:

```bash
npm test
```

## Error Handling

The dashboard is designed to remain usable when an external data source is slow or unavailable.

Implemented safeguards include:

- Request timeouts
- Per-holding error isolation
- Cached responses
- Partial-data indicators
- Nullable market values
- Safe portfolio calculations
- User-triggered refresh
- Automatic refresh intervals

A failed request for one holding does not prevent the remaining portfolio from loading.

## Assumptions and Limitations

- Portfolio holdings are based on the spreadsheet supplied with the assignment.
- Holdings are stored locally in `data/holdings.ts`.
- Prices may be delayed depending on the upstream market-data provider.
- P/E and EPS values are displayed only when available from Google Finance.
- Google Finance extraction depends on its current HTML structure.
- This project is intended as a portfolio monitoring demonstration and not as financial advice.
- Market values may differ from broker platforms because of price delays, symbol mappings, or market timing.

## Deployment

The project is designed for deployment on Vercel.

```text
Deployment URL: [https://8byte-portfolio-dashboard-tau.vercel.app/](https://8byte-portfolio-dashboard-tau.vercel.app/)
```

## Author

### Gopal Chawla

GitHub: [gopal229310188](https://github.com/gopal229310188)
