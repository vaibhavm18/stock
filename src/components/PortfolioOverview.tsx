import { PortfolioData } from "@/lib/types";

interface PortfolioOverviewProps {
  data: PortfolioData;
}

export default function PortfolioOverview({ data }: PortfolioOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-secondary p-4 rounded-lg">
        <p className="text-secondary-foreground">Total Portfolio Value</p>
        <p className="text-2xl font-bold">${data.totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      <div className="bg-secondary p-4 rounded-lg">
        <p className="text-secondary-foreground">Total Profit</p>
        <p className="text-2xl font-bold text-green-600">${data.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      <div className="bg-secondary p-4 rounded-lg">
        <p className="text-secondary-foreground">Total Loss</p>
        <p className="text-2xl font-bold text-red-600">${data.totalLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      <div className="bg-secondary p-4 rounded-lg">
        <p className="text-secondary-foreground">Number of Stocks</p>
        <p className="text-2xl font-bold">{data.numStocks}</p>
      </div>
    </div>
  )
}

