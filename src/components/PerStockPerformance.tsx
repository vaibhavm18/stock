import { Card, CardContent } from "@/components/ui/card"
import { Stock } from "@/lib/types";

interface PerStockPerformanceProps {
  holdings: Stock[];
}

export default function PerStockPerformance({ holdings }: PerStockPerformanceProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {holdings.map((stock, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-2">{stock.name}</h3>
            <p>Number of Buys: {stock.numBuys}</p>
            <p>Number of Sells: {stock.numSells}</p>
            <p className="font-semibold text-green-600">
              Average Gain per Sale: {stock.avgGainPerSale}%
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

