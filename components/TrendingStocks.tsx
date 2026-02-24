import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

const trendingData = [
  { symbol: "NVDA", price: "144.37", change: "+2.45", percent: "+1.72%", trend: "up" },
  { symbol: "TSLA", price: "248.98", change: "-2.34", percent: "-0.93%", trend: "down" },
  { symbol: "AAPL", price: "229.87", change: "+2.45", percent: "+1.08%", trend: "up" },
  { symbol: "MSFT", price: "441.58", change: "+8.92", percent: "+2.06%", trend: "up" },
  { symbol: "AMZN", price: "197.12", change: "+4.67", percent: "+2.43%", trend: "up" },
]

const marketMovers = [
  { name: "Most Active", symbol: "SQQQ", value: "1.08" },
  { name: "Gainers", symbol: "TQQQ", value: "2.45" },
  { name: "Losers", symbol: "UVXY", value: "-3.21" },
]

export function TrendingStocks() {
  return (
    <div className="space-y-6">
      {/* Market Movers */}
      <Card className="p-4">
        <h3 className="font-bold mb-4">Market Movers</h3>
        <div className="space-y-3">
          {marketMovers.map((mover, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{mover.name}</div>
                <div className="text-xs text-gray-500">{mover.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{mover.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending Stocks */}
      <Card className="p-4">
        <h3 className="font-bold mb-4">Trending Stocks</h3>
        <div className="space-y-3">
          {trendingData.map((stock, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-600">
                  {stock.symbol.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{stock.symbol}</div>
                  <div className="text-xs text-gray-500">{stock.price}</div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-medium flex items-center space-x-1 ${stock.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  {stock.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{stock.percent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Most Undervalued Stocks */}
      <Card className="p-4">
        <h3 className="font-bold mb-4">Most Undervalued Stocks</h3>
        <div className="space-y-3">
          {trendingData.slice(0, 3).map((stock, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{stock.symbol}</div>
                <div className="text-xs text-gray-500">Fair Value</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{stock.price}</div>
                <div className="text-xs text-green-600">+15.2%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
