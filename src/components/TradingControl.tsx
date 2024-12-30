import { Button } from "@/components/ui/button"

interface TradingControlProps {
  isTrading: boolean;
  onToggle: () => void;
}

export default function TradingControl({ isTrading, onToggle }: TradingControlProps) {
  return (
    <Button
      onClick={onToggle}
      variant={isTrading ? "destructive" : "default"}
    >
      {isTrading ? 'Stop Trading' : 'Start Trading'}
    </Button>
  )
}

