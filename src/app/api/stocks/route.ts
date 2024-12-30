import Alpaca from '@alpacahq/alpaca-trade-api';
import { NextResponse } from 'next/server';

// Replace with your Alpaca API Key and Secret
const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY, 
  secretKey: process.env.ALPACA_API_SECRET,
  paper: true, // Use paper trading environment, change to false for live
});

export async function GET() {
  const tickers = ['TD.TO', 'CM.TO', 'BNS.TO', 'RY.TO', 'BMO.TO'];

  try {
    const stockData = [];

    // Fetch historical data for these tickers using getBarsV2
    for (const ticker of tickers) {
      const bars = [];

      // Use async generator to iterate over the bars returned by getBarsV2
      for await (const bar of alpaca.getBarsV2('day', ticker)) {
        console.log("Ticker", ticker)
        bars.push(bar);
      }

      stockData.push({
        ticker,
        bars,
      });
    }

    return NextResponse.json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json({ error: 'Error fetching stock data' }, { status: 500 });
  }
}
