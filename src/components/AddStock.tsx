'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Stock } from '@/lib/types'

interface AddStockProps {
  onAddStock: (stock: Stock) => void;
}

// Mock stock data - in a real app, this would come from an API
const mockStockResults = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 173.50, change: 2.5 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.8 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 338.45, change: 1.2 },
];

export default function AddStock({ onAddStock }: AddStockProps) {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (value: string) => {
    setSearch(value)
    if (value.length >= 2) {
      setIsSearching(true)
      // In a real app, you would fetch from a stock API here
      // Simulating API call with mock data
      setTimeout(() => {
        const filteredResults = mockStockResults.filter(stock => 
          stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
          stock.name.toLowerCase().includes(value.toLowerCase())
        )
        setSearchResults(filteredResults)
        setIsSearching(false)
      }, 300)
    } else {
      setSearchResults([])
    }
  }

  const handleSelectStock = (selectedStock: any) => {
    const newStock: Stock = {
      name: selectedStock.symbol,
      lots: [
        { 
          lotNumber: 1, 
          shares: 100, 
          purchasePrice: selectedStock.price, 
          currentValue: selectedStock.price * 100, 
          unrealizedGainLoss: 0, 
          daysHeld: 0 
        }
      ],
      numBuys: 1,
      numSells: 0,
      avgGainPerSale: 0
    }
    onAddStock(newStock)
    setSearch('')
    setSearchResults([])
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={(e) => e.preventDefault()} className="flex items-center">
        <div className="relative flex-1">
          <Input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for stocks"
            className="w-full"
          />
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {searchResults.map((stock) => (
            <Card key={stock.symbol} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSelectStock(stock)}>
              <CardHeader className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{stock.symbol}</CardTitle>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${stock.price}</p>
                    <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="mt-4 text-center text-gray-600">
          Searching...
        </div>
      )}

      {search.length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="mt-4 text-center text-gray-600">
          No results found
        </div>
      )}
    </div>
  )
}