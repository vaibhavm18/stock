"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurrentHoldings from "./CurrentHoldings";
import PerStockPerformance from "./PerStockPerformance";
import AddStock from "./AddStock";
import { PortfolioData, Stock } from "@/lib/types";
import PortfolioOverview from "./PortfolioOverview";
import TradingControl from "./TradingControl";

export default function Portfolio() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalPortfolioValue: 956356.01,
    totalProfit: 376356.01,
    totalLoss: 50000.0,
    numStocks: 5,
    holdings: [
      {
        name: "TD.TO",
        lots: [
          {
            lotNumber: 1,
            shares: 363,
            purchasePrice: 91.77,
            currentValue: 29570.25,
            unrealizedGainLoss: -11.2,
            daysHeld: 713,
          },
        ],
        numBuys: 652,
        numSells: 645,
        avgGainPerSale: 5.4,
      },
    ],
    isTrading: false,
  });

  const addStock = (stock: Stock) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      numStocks: prevData.numStocks + 1,
      holdings: [...prevData.holdings, stock],
    }));
  };

  const toggleTrading = () => {
    setPortfolioData((prevData) => ({
      ...prevData,
      isTrading: !prevData.isTrading,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioOverview data={portfolioData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentHoldings
            holdings={portfolioData.holdings}
            isTrading={portfolioData.isTrading}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Per-Stock Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <PerStockPerformance holdings={portfolioData.holdings} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex p-4 space-x-5 items-center border-red-900">
          <AddStock onAddStock={addStock} />
          <TradingControl
            isTrading={portfolioData.isTrading}
            onToggle={toggleTrading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
