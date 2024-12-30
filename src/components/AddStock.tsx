'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stock } from '@/lib/types'

interface AddStockProps {
  onAddStock: (stock: Stock) => void;
}

export default function AddStock({ onAddStock }: AddStockProps) {
  const [search, setSearch] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if(!search) {
      return;
    }
    // In a real application, you would fetch stock data here
    const newStock: Stock = {
      name: search,
      lots: [
        { lotNumber: 1, shares: 100, purchasePrice: 50, currentValue: 5000, unrealizedGainLoss: 0, daysHeld: 0 }
      ],
      numBuys: 1,
      numSells: 0,
      avgGainPerSale: 0
    }
    onAddStock(newStock)
    setSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className=" w-full max-w-2xl flex items-center ">
      <div className="relative flex-1">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for stocks"
          className='w-full'
        />
      </div>
      <Button type="submit" className="ml-4" disabled={!search}>
        Add Stock
      </Button>
    </form>
  )
}

