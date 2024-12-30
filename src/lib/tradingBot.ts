import axios from "axios";
import { DateTime } from "luxon";
console.log("Hello God!")

interface Position {
  shares: number;
  purchase_price: number;
  purchase_date: DateTime;
}

interface Transaction {
  date: DateTime;
  action: string;
  ticker: string;
  shares: number;
  price: number;
  total: number;
  remaining_capital: number;
  gain?: number;
  days_held?: number;
}

class TradingBot {
  initial_capital: number;
  capital: number;
  portfolio: { [key: string]: Position[] };
  transaction_history: Transaction[];
  stocks: string[];

  constructor(initial_capital: number = 200000) {
    this.initial_capital = initial_capital;
    this.capital = initial_capital;
    this.portfolio = {};
    this.transaction_history = [];
    this.stocks = ["TD.TO", "CM.TO", "BNS.TO", "RY.TO", "BMO.TO"];
  }

  async downloadHistoricalData(
    startDate: string,
    endDate: string
  ): Promise<{ [key: string]: any; first_dates: { [key: string]: string } }> {
    const data: { [key: string]: any } = {};
    const firstDates: { [key: string]: string } = {};

    for (const ticker of this.stocks) {
      try {
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${startDate}&period2=${endDate}&interval=1d&events=history`
        );
        const csvData = response.data;
        // @ts-ignore
        const rows = csvData.split("\n").map((row) => row.split(","));
        const headers = rows[0];
        const dateIndex = headers.indexOf("Date");
        const closeIndex = headers.indexOf("Close");

        if (dateIndex !== -1 && closeIndex !== -1) {
          // @ts-ignore
          const stockData = rows.slice(1).map((row) => ({
            date: row[dateIndex],
            close: parseFloat(row[closeIndex]),
          }));

          data[ticker] = stockData;
          firstDates[ticker] = stockData[0].date;
          console.log(
            `First available date for ${ticker}: ${firstDates[ticker]}`
          );
        }
      } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
      }
    }

    return { data, first_dates: firstDates };
  }

  buyStocks(
    date: DateTime,
    prices: { [key: string]: any },
    availableStocks: string[]
  ): void {
    if (availableStocks.length === 0) {
      return;
    }

    const amountPerStock = this.capital / availableStocks.length;

    for (const ticker of availableStocks) {
      if (!prices[ticker]) {
        continue;
      }

      const priceData = prices[ticker];
      if (!priceData || priceData.length === 0 || !priceData[0].close) {
        continue;
      }

      const price = priceData[0].close;
      const shares = Math.floor(amountPerStock / price);

      if (shares > 0) {
        const cost = shares * price;
        this.capital -= cost;

        // Create a new position for this purchase
        const position: Position = {
          shares,
          purchase_price: price,
          purchase_date: date,
        };

        // Add to list of positions for this ticker
        if (!this.portfolio[ticker]) {
          this.portfolio[ticker] = [];
        }
        this.portfolio[ticker].push(position);

        this.transaction_history.push({
          date,
          action: "BUY",
          ticker,
          shares,
          price,
          total: cost,
          remaining_capital: this.capital,
        });

        console.log(
          `Bought ${shares} shares of ${ticker} at $${price.toFixed(
            2
          )} for total $${cost.toFixed(2)}`
        );
      }
    }
  }

  checkAndSell(date: DateTime, prices: { [key: string]: any }): string[] {
    const stocksSold: string[] = [];

    for (const ticker of Object.keys(this.portfolio)) {
      if (!prices[ticker]) {
        continue;
      }

      const priceData = prices[ticker];
      if (!priceData || priceData.length === 0 || !priceData[0].close) {
        continue;
      }

      const currentPrice = priceData[0].close;

      // Check each position separately
      const positionsToKeep: Position[] = [];
      for (const position of this.portfolio[ticker]) {
        const purchasePrice = position.purchase_price;
        const shares = position.shares;

        const gain = (currentPrice - purchasePrice) / purchasePrice;

        if (gain >= 0.05) {
          // 5% threshold
          const proceeds = shares * currentPrice;
          this.capital += proceeds;

          this.transaction_history.push({
            date,
            action: "SELL",
            ticker,
            shares,
            price: currentPrice,
            total: proceeds,
            gain: gain * 100,
            remaining_capital: this.capital,
            days_held: date.diff(position.purchase_date, "days").days,
          });

          console.log(
            `Sold ${shares} shares of ${ticker} at $${currentPrice.toFixed(
              2
            )} for total $${proceeds.toFixed(2)} (Gain: ${(gain * 100).toFixed(
              1
            )}%)`
          );

          stocksSold.push(ticker);
        } else {
          positionsToKeep.push(position);
        }
      }

      if (positionsToKeep.length > 0) {
        this.portfolio[ticker] = positionsToKeep;
      } else {
        delete this.portfolio[ticker];
      }
    }

    return Array.from(new Set(stocksSold)); // Remove duplicates
  }
}

export default TradingBot;

export async function runSimulation(
  startDate: string = "2010-01-01",
  endDate: string = "2023-12-31"
): Promise<any> {
  const bot = new TradingBot();
  console.log(`Starting simulation with $${bot.capital.toFixed(2)}`);

  // Download historical data and get first available dates
  const { data, first_dates } = await bot.downloadHistoricalData(
    startDate,
    endDate
  );

  // Get all dates from the data (daily)
  const allDates = Array.from({
    length:
      DateTime.fromISO(endDate).diff(DateTime.fromISO(startDate), "days").days +
      1,
  }).map((_, index) => DateTime.fromISO(startDate).plus({ days: index }));

  for (const currentDate of allDates) {
    // Skip weekends
    if (currentDate.weekday >= 6) continue;

    // Determine which stocks are available at this date
    const availableStocks = Object.keys(first_dates).filter(
      (ticker) => DateTime.fromISO(first_dates[ticker]) <= currentDate
    );

    // Get prices for current date
    const currentPrices: { [key: string]: any } = {};
    for (const ticker of Object.keys(data)) {
      const stockData = data[ticker];
      const currentPrice = stockData.find((row: any) =>
        DateTime.fromISO(row.date).hasSame(currentDate, "day")
      );
      if (currentPrice) {
        currentPrices[ticker] = currentPrice;
      }
    }

    // First, check if any current holdings should be sold
    const stocksSold = bot.checkAndSell(currentDate, currentPrices);

    // If we sold any stocks or have available capital, try to buy
    if (stocksSold.length > 0 || Object.keys(bot.portfolio).length === 0) {
      bot.buyStocks(currentDate, currentPrices, availableStocks);
    }
  }

  // Calculate final results and portfolio value
  let finalPortfolioValue = 0;
  for (const ticker in bot.portfolio) {
    // @ts-ignore
    if (currentPrices[ticker]) {
      // @ts-ignore
      const finalPrice = currentPrices[ticker].close;
      for (const position of bot.portfolio[ticker]) {
        finalPortfolioValue += position.shares * finalPrice;
      }
    }
  }

  const totalValue = bot.capital + finalPortfolioValue;
  const totalReturn =
    ((totalValue - bot.initial_capital) / bot.initial_capital) * 100;

  console.log("\n=== FINAL SIMULATION RESULTS ===");
  console.log(`Initial Investment: $${bot.initial_capital.toLocaleString()}`);
  console.log(`Cash on Hand: $${bot.capital.toLocaleString()}`);
  console.log(
    `Value of Current Holdings: $${finalPortfolioValue.toLocaleString()}`
  );
  console.log(`Total Portfolio Value: $${totalValue.toLocaleString()}`);
  console.log(`Total Return: ${totalReturn.toFixed(1)}%`);

  // Calculate average holding period
  const holdingPeriods = bot.transaction_history
    .filter((trade: any) => trade.days_held !== undefined)
    .map((trade: any) => trade.days_held);
  if (holdingPeriods.length > 0) {
    const avgHoldingPeriod =
      holdingPeriods.reduce((sum: number, period: number) => sum + period, 0) /
      holdingPeriods.length;
    console.log(
      `\nAverage Holding Period: ${avgHoldingPeriod.toFixed(1)} days`
    );
  }

  if (Object.keys(bot.portfolio).length > 0) {
    console.log("\nCurrent Holdings:");
    for (const ticker in bot.portfolio) {
      // @ts-ignore
      if (currentPrices[ticker]) {
        // @ts-ignore
        const currentPrice = currentPrices[ticker].close;
        console.log(`\n${ticker}:`);
        let totalShares = 0;
        let totalValue = 0;
        for (let i = 0; i < bot.portfolio[ticker].length; i++) {
          const position = bot.portfolio[ticker][i];
          const positionValue = position.shares * currentPrice;
          totalShares += position.shares;
          totalValue += positionValue;
          const unrealizedGain =
            ((currentPrice - position.purchase_price) /
              position.purchase_price) *
            100;
          // @ts-ignore
          const daysHeld = currentDate.diff(
            DateTime.fromISO(position.purchase_date.toString()),
            "days"
          ).days;
          console.log(
            `  Lot ${i + 1}: ${
              position.shares
            } shares @ $${position.purchase_price.toFixed(2)}`
          );
          console.log(`    Current value: $${positionValue.toLocaleString()}`);
          console.log(`    Unrealized gain: ${unrealizedGain.toFixed(1)}%`);
          console.log(`    Days held: ${daysHeld}`);
        }
        console.log(
          `  Total: ${totalShares} shares, Value: $${totalValue.toLocaleString()}`
        );
      }
    }
  }

  // Calculate statistics for each stock
  const tradesByStock: {
    [key: string]: { buys: number; sells: number; total_gain: number };
  } = {};
  for (const trade of bot.transaction_history) {
    const ticker = trade.ticker;
    if (!tradesByStock[ticker]) {
      tradesByStock[ticker] = { buys: 0, sells: 0, total_gain: 0 };
    }

    if (trade.action === "BUY") {
      tradesByStock[ticker].buys += 1;
    } else {
      // SELL
      tradesByStock[ticker].sells += 1;
      tradesByStock[ticker].total_gain += trade.gain || 0;
    }
  }

  console.log("\nPer-Stock Performance:");
  for (const ticker in tradesByStock) {
    const stats = tradesByStock[ticker];
    const avgGain = stats.sells > 0 ? stats.total_gain / stats.sells : 0;
    console.log(`${ticker}: ${stats.buys} buys, ${stats.sells} sells`);
    console.log(`  Average gain per sale: ${avgGain.toFixed(1)}%`);
  }

  return { transactionHistory: bot.transaction_history, tradesByStock };
}

// runSimulation().then(({ transactionHistory, tradesByStock }) => {
//   console.log("Trans", transactionHistory, tradesByStock);
// });
