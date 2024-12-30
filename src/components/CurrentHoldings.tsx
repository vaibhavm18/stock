'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lot, Stock } from '@/lib/types'

interface StockLotProps {
  lot: Lot;
}

function StockLot({ lot }: StockLotProps) {
  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <p className="font-semibold">Lot {lot.lotNumber}</p>
        <p>Shares: {lot.shares}</p>
        <p>Purchase Price: ${lot.purchasePrice.toFixed(2)}</p>
        <p>Current Value: ${lot.currentValue.toFixed(2)}</p>
        <p className={`font-semibold ${lot.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Unrealized Gain/Loss: {lot.unrealizedGainLoss}%
        </p>
        <p>Days Held: {lot.daysHeld}</p>
      </CardContent>
    </Card>
  )
}

interface StockHoldingProps {
  stock: Stock;
  isTrading: boolean;
}

function StockHolding({ stock, isTrading }: StockHoldingProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <h3 className="text-xl font-semibold">{stock.name}</h3>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
        {isExpanded && (
          <div className="mt-4">
            {stock.lots.map((lot, index) => (
              <StockLot key={index} lot={lot} />
            ))}
            {isTrading && (
              <div className="mt-4 space-x-2">
                <Button variant="default">Buy</Button>
                <Button variant="destructive">Sell</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CurrentHoldingsProps {
  holdings: Stock[];
  isTrading: boolean;
}

export default function CurrentHoldings({ holdings, isTrading }: CurrentHoldingsProps) {
  return (
    <div>
      {holdings.map((stock, index) => (
        <StockHolding key={index} stock={stock} isTrading={isTrading} />
      ))}
    </div>
  )
}

