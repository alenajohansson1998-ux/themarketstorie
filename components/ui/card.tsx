import * as React from "react"
import { cn } from "@/lib/utils"

/** A grouped surface. Use sparingly: most sections need only spacing and a hairline. */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-card bg-surface text-ink", className)} {...props} />
  )
)
Card.displayName = "Card"

export { Card }
