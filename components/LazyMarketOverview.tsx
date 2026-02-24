import dynamic from 'next/dynamic'
import { Card } from "@/components/ui/card"

// Loading skeleton for MarketOverview
function MarketOverviewSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// Dynamically import the actual component
const MarketOverview = dynamic(() => import('./MarketOverview').then(mod => ({ default: mod.MarketOverview })), {
  loading: () => <MarketOverviewSkeleton />,
  ssr: false // Load only on client-side to avoid hydration issues
})

export { MarketOverview }
