import dynamic from 'next/dynamic'
import { Card } from "@/components/ui/card"

// Loading skeleton for PopularScreens
function PopularScreensSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Dynamically import the actual component
const PopularScreens = dynamic(() => import('./popular-screens').then(mod => ({ default: mod.PopularScreens })), {
  loading: () => <PopularScreensSkeleton />,
  ssr: false
})

export { PopularScreens }
